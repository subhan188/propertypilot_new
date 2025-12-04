import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { renovationService } from '@/services/renovationService';
import { RenovationItemSchema, UpdateRenovationItemSchema } from '@/models/schemas';
import { ApiError } from '@/utils/errors';
import { authMiddleware } from '@/middleware/auth';

export async function listRenovationsRoute(request: FastifyRequest, reply: FastifyReply) {
  try {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: 'Unauthorized',
      });
    }

    const { propertyId } = request.params as { propertyId: string };
    const { status } = request.query as { status?: string };
    const renovations = await renovationService.getRenovations(request.userId, propertyId, {
      status,
    });

    return reply.send({
      success: true,
      data: { renovations },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return reply.status(error.statusCode).send({
        success: false,
        error: error.message,
      });
    }
    throw error;
  }
}

export async function createRenovationRoute(request: FastifyRequest, reply: FastifyReply) {
  try {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: 'Unauthorized',
      });
    }

    const { propertyId } = request.params as { propertyId: string };
    const body = RenovationItemSchema.parse(request.body);
    const renovation = await renovationService.createRenovation(request.userId, propertyId, body);

    return reply.status(201).send({
      success: true,
      data: { renovation },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return reply.status(error.statusCode).send({
        success: false,
        error: error.message,
        details: error.details,
      });
    }
    throw error;
  }
}

export async function updateRenovationRoute(request: FastifyRequest, reply: FastifyReply) {
  try {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: 'Unauthorized',
      });
    }

    const { id } = request.params as { id: string };
    const body = UpdateRenovationItemSchema.parse(request.body);
    const renovation = await renovationService.updateRenovation(request.userId, id, body);

    return reply.send({
      success: true,
      data: { renovation },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return reply.status(error.statusCode).send({
        success: false,
        error: error.message,
        details: error.details,
      });
    }
    throw error;
  }
}

export async function deleteRenovationRoute(request: FastifyRequest, reply: FastifyReply) {
  try {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: 'Unauthorized',
      });
    }

    const { id } = request.params as { id: string };
    await renovationService.deleteRenovation(request.userId, id);

    return reply.send({
      success: true,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return reply.status(error.statusCode).send({
        success: false,
        error: error.message,
      });
    }
    throw error;
  }
}

export async function getRenovationStatsRoute(request: FastifyRequest, reply: FastifyReply) {
  try {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: 'Unauthorized',
      });
    }

    const { propertyId } = request.params as { propertyId: string };
    const stats = await renovationService.getRenovationStats(request.userId, propertyId);

    return reply.send({
      success: true,
      data: { stats },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return reply.status(error.statusCode).send({
        success: false,
        error: error.message,
      });
    }
    throw error;
  }
}

export async function renovationRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', authMiddleware);

  fastify.get<{ Params: { propertyId: string }; Querystring: any }>(
    '/properties/:propertyId/renovations',
    listRenovationsRoute
  );
  fastify.post<{ Params: { propertyId: string }; Body: any }>(
    '/properties/:propertyId/renovations',
    createRenovationRoute
  );
  fastify.put<{ Params: { id: string }; Body: any }>(
    '/renovations/:id',
    updateRenovationRoute
  );
  fastify.delete<{ Params: { id: string } }>(
    '/renovations/:id',
    deleteRenovationRoute
  );
  fastify.get<{ Params: { propertyId: string } }>(
    '/properties/:propertyId/renovations/stats',
    getRenovationStatsRoute
  );
}
