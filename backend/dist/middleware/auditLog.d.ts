/**
 * Audit Logging Middleware
 * Logs all user actions for compliance and security purposes
 */
import { FastifyInstance } from 'fastify';
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
 * Register audit logging middleware
 */
export declare function registerAuditLogging(fastify: FastifyInstance): void;
/**
 * Retrieve audit logs for a user (admin only or own logs)
 */
export declare function getAuditLogs(userId: string, options?: {
    limit?: number;
    offset?: number;
    resourceType?: string;
    action?: string;
}): Promise<{
    logs: {
        id: string;
        createdAt: Date;
        userId: string;
        resourceType: string;
        action: string;
        resourceId: string | null;
        changes: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
    }[];
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
}>;
/**
 * Delete old audit logs (retention policy)
 * Keeps logs for 90 days
 */
export declare function pruneOldAuditLogs(): Promise<number>;
//# sourceMappingURL=auditLog.d.ts.map