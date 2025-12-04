/**
 * Integrations API Routes
 * Manage connections to external real estate data providers
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@/db/prisma';
import { RealEstateAdapterFactory } from '@/adapters/realEstateAdapter';
import { mockAdapter } from '@/adapters/mockAdapter';
import { ZillowAdapter } from '@/adapters/zillow';
import { AirDnaAdapter } from '@/adapters/airdna';
import { MLSAdapter } from '@/adapters/mls';
import { NotFoundError, ValidationError } from '@/utils/errors';

/**
 * Register adapters with factory
 */
function initializeAdapters() {
  RealEstateAdapterFactory.registerAdapter('mock', mockAdapter);
  // Additional adapters can be registered here with API keys
}

async function getIntegrations(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.session.userId as string;

  try {
    const integrations = await prisma.integration.findMany({
      where: { userId },
      select: {
        id: true,
        service: true,
        isActive: true,
        config: true,
        lastSyncAt: true,
        syncStatus: true,
      },
    });

    const availableAdapters = await RealEstateAdapterFactory.getAvailableAdapters();
    const availableServices = availableAdapters.map((adapter) => adapter.constructor.name);

    return reply.send({
      success: true,
      data: {
        integrations,
        available: {
          services: ['zillow', 'airdna', 'mls', 'mock'],
          supported: availableServices,
        },
      },
    });
  } catch (error: any) {
    reply.server.log.error(error);
    return reply.code(500).send({
      success: false,
      error: 'Failed to fetch integrations',
    });
  }
}

async function connectService(
  request: FastifyRequest<{ Params: { service: string }; Body: any }>,
  reply: FastifyReply
) {
  const userId = request.session.userId as string;
  const { service } = request.params;
  const body = request.body as any;

  try {
    const { apiKey, config } = body;

    if (!apiKey) {
      throw new ValidationError({
        apiKey: 'API key is required',
      });
    }

    // Check if integration already exists
    const existing = await prisma.integration.findFirst({
      where: { userId, service },
    });

    if (existing) {
      throw new ValidationError({
        service: 'Integration already exists. Disconnect first.',
      });
    }

    // Test the API key by creating adapter instance
    let adapter;
    switch (service.toLowerCase()) {
      case 'zillow':
        adapter = new ZillowAdapter(apiKey || undefined);
        break;
      case 'airdna':
        adapter = new AirDnaAdapter(apiKey || undefined);
        break;
      case 'mls':
        const region = (config?.region || 'default') as string;
        adapter = new MLSAdapter(region, apiKey || undefined);
        break;
      default:
        throw new ValidationError({
          service: 'Unsupported service',
        });
    }

    // Test availability
    const isAvailable = await adapter.isAvailable();
    if (!isAvailable) {
      throw new Error('Invalid API credentials');
    }

    // Save integration
    const integration = await prisma.integration.create({
      data: {
        userId,
        service: service.toLowerCase(),
        isActive: true,
        apiKey, // In production, encrypt this
        apiSecret: '', // If needed
        config: config || {},
        syncStatus: 'ready',
      },
    });

    // Register adapter with factory
    RealEstateAdapterFactory.registerAdapter(service.toLowerCase(), adapter);

    return reply.code(201).send({
      success: true,
      data: {
        id: integration.id,
        service: integration.service,
        isActive: integration.isActive,
        message: `${service} integration connected successfully`,
      },
    });
  } catch (error: any) {
    reply.server.log.error(error);

    if (error instanceof ValidationError) {
      return reply.code(400).send({
        success: false,
        error: error.message,
        details: error.details,
      });
    }

    return reply.code(500).send({
      success: false,
      error: error.message,
    });
  }
}

async function disconnectService(
  request: FastifyRequest<{ Params: { service: string } }>,
  reply: FastifyReply
) {
  const userId = request.session.userId as string;
  const { service } = request.params;

  try {
    const integration = await prisma.integration.findFirst({
      where: { userId, service: service.toLowerCase() },
    });

    if (!integration) {
      throw new NotFoundError('Integration');
    }

    // Delete integration
    await prisma.integration.delete({
      where: { id: integration.id },
    });

    return reply.send({
      success: true,
      data: {
        message: `${service} integration disconnected`,
      },
    });
  } catch (error: any) {
    reply.server.log.error(error);

    if (error instanceof NotFoundError) {
      return reply.code(404).send({
        success: false,
        error: error.message,
      });
    }

    return reply.code(500).send({
      success: false,
      error: 'Failed to disconnect service',
    });
  }
}

async function testConnection(
  request: FastifyRequest<{ Params: { service: string } }>,
  reply: FastifyReply
) {
  const userId = request.session.userId as string;
  const { service } = request.params;

  try {
    const integration = await prisma.integration.findFirst({
      where: { userId, service: service.toLowerCase() },
    });

    if (!integration) {
      throw new NotFoundError('Integration');
    }

    // Create adapter and test
    let adapter;
    switch (service.toLowerCase()) {
      case 'zillow':
        adapter = new ZillowAdapter(integration.apiKey || undefined);
        break;
      case 'airdna':
        adapter = new AirDnaAdapter(integration.apiKey || undefined);
        break;
      case 'mls':
        const config = integration.config as any;
        adapter = new MLSAdapter((config?.region || 'default') as string, integration.apiKey || undefined);
        break;
      default:
        throw new ValidationError({
          service: 'Unsupported service',
        });
    }

    const isAvailable = await adapter.isAvailable();

    // Update last sync time
    await prisma.integration.update({
      where: { id: integration.id },
      data: {
        syncStatus: isAvailable ? 'success' : 'failed',
        lastSyncAt: new Date(),
      },
    });

    return reply.send({
      success: true,
      data: {
        service: integration.service,
        available: isAvailable,
        lastSyncAt: integration.lastSyncAt,
      },
    });
  } catch (error: any) {
    reply.server.log.error(error);

    if (error instanceof NotFoundError) {
      return reply.code(404).send({
        success: false,
        error: error.message,
      });
    }

    return reply.code(500).send({
      success: false,
      error: 'Failed to test connection',
    });
  }
}

export async function integrationRoutes(fastify: FastifyInstance) {
  // Initialize adapters on startup
  initializeAdapters();

  fastify.get('/api/integrations', getIntegrations);

  fastify.post<{ Params: { service: string }; Body: any }>(
    '/api/integrations/:service/connect',
    connectService
  );

  fastify.delete<{ Params: { service: string } }>(
    '/api/integrations/:service/disconnect',
    disconnectService
  );

  fastify.post<{ Params: { service: string } }>('/api/integrations/:service/test', testConnection);
}
