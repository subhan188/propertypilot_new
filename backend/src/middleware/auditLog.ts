/**
 * Audit Logging Middleware
 * Logs all user actions for compliance and security purposes
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@/db/prisma';

export interface AuditLogEntry {
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  changes?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  statusCode: number;
}

/**
 * Determine action type from request method and path
 */
function determineAction(method: string, path: string): string {
  if (method === 'POST') return 'CREATE';
  if (method === 'PUT' || method === 'PATCH') return 'UPDATE';
  if (method === 'DELETE') return 'DELETE';
  if (method === 'GET') return 'READ';
  return 'UNKNOWN';
}

/**
 * Determine resource type from path
 */
function determineResourceType(path: string): string {
  const parts = path.split('/');
  const apiIndex = parts.indexOf('api');
  if (apiIndex !== -1 && apiIndex < parts.length - 1) {
    return parts[apiIndex + 1].toUpperCase();
  }
  return 'UNKNOWN';
}

/**
 * Register audit logging middleware
 */
export function registerAuditLogging(fastify: FastifyInstance) {
  fastify.addHook('onResponse', async (request, reply) => {
    // Only log if user is authenticated and it's an API call
    if (!request.session.userId || !request.url.includes('/api')) {
      return;
    }

    const userId = request.session.userId as string;
    const method = request.method;
    const path = request.url.split('?')[0]; // Remove query string

    // Skip health checks and non-modifying reads
    if (path === '/health' || (method === 'GET' && path.includes('export'))) {
      return;
    }

    const action = determineAction(method, path);
    const resourceType = determineResourceType(path);

    // Extract resource ID from path (for routes like /api/properties/:id)
    const pathSegments = path.split('/').filter((s) => s && s !== 'api');
    let resourceId: string | undefined;

    // Try to find UUID in path segments
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    for (const segment of pathSegments) {
      if (uuidPattern.test(segment)) {
        resourceId = segment;
        break;
      }
    }

    // Get client IP
    const ipAddress =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (request.headers['x-real-ip'] as string) ||
      request.ip ||
      'unknown';

    const userAgent = (request.headers['user-agent'] as string) || 'unknown';

    // Only log mutations (not all reads) to reduce database bloat
    if (
      ['CREATE', 'UPDATE', 'DELETE'].includes(action) ||
      (action === 'READ' && resourceType !== 'PROPERTIES')
    ) {
      try {
        await prisma.auditLog.create({
          data: {
            userId,
            action,
            resourceType,
            resourceId,
            changes: method !== 'GET' ? (request.body as Record<string, any>) : undefined,
            ipAddress,
            userAgent,
          },
        });
      } catch (error) {
        // Don't fail the request if audit logging fails
        fastify.log.warn('Failed to create audit log: ' + (error instanceof Error ? error.message : String(error)));
      }
    }
  });
}

/**
 * Retrieve audit logs for a user (admin only or own logs)
 */
export async function getAuditLogs(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    resourceType?: string;
    action?: string;
  }
) {
  const { limit = 100, offset = 0, resourceType, action } = options || {};

  const where: any = { userId };

  if (resourceType) where.resourceType = resourceType;
  if (action) where.action = action;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    total,
    limit,
    offset,
    hasMore: offset + limit < total,
  };
}

/**
 * Delete old audit logs (retention policy)
 * Keeps logs for 90 days
 */
export async function pruneOldAuditLogs() {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const result = await prisma.auditLog.deleteMany({
    where: {
      createdAt: {
        lt: ninetyDaysAgo,
      },
    },
  });

  return result.count;
}
