import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { alertService } from '@/services/alertService';
import { ApiError } from '@/utils/errors';
import { authMiddleware } from '@/middleware/auth';

export async function listAlertsRoute(request: FastifyRequest, reply: FastifyReply) {
  try {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: 'Unauthorized',
      });
    }

    const { read, type, limit } = request.query as {
      read?: string;
      type?: string;
      limit?: string;
    };

    const filters: any = {};
    if (read !== undefined) {
      filters.read = read === 'true';
    }
    if (type) filters.type = type;
    if (limit) filters.limit = parseInt(limit);

    const { alerts, unreadCount } = await alertService.getAlerts(request.userId, filters);

    return reply.send({
      success: true,
      data: { alerts, unreadCount },
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

export async function markAsReadRoute(request: FastifyRequest, reply: FastifyReply) {
  try {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: 'Unauthorized',
      });
    }

    const { id } = request.params as { id: string };
    const alert = await alertService.markAsRead(request.userId, id);

    return reply.send({
      success: true,
      data: { alert },
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

export async function markAllAsReadRoute(request: FastifyRequest, reply: FastifyReply) {
  try {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: 'Unauthorized',
      });
    }

    await alertService.markAllAsRead(request.userId);

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

export async function deleteAlertRoute(request: FastifyRequest, reply: FastifyReply) {
  try {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: 'Unauthorized',
      });
    }

    const { id } = request.params as { id: string };
    await alertService.deleteAlert(request.userId, id);

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

export async function getAlertStatsRoute(request: FastifyRequest, reply: FastifyReply) {
  try {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: 'Unauthorized',
      });
    }

    const stats = await alertService.getAlertStats(request.userId);

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

export async function alertRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', authMiddleware);

  fastify.get<{ Querystring: any }>('/alerts', listAlertsRoute);
  fastify.put<{ Params: { id: string } }>('/alerts/:id/read', markAsReadRoute);
  fastify.post('/alerts/mark-all-read', markAllAsReadRoute);
  fastify.delete<{ Params: { id: string } }>('/alerts/:id', deleteAlertRoute);
  fastify.get('/alerts/stats', getAlertStatsRoute);
}
