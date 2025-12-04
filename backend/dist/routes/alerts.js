import { alertService } from '@/services/alertService';
import { ApiError } from '@/utils/errors';
import { authMiddleware } from '@/middleware/auth';
export async function listAlertsRoute(request, reply) {
    try {
        if (!request.userId) {
            return reply.status(401).send({
                success: false,
                error: 'Unauthorized',
            });
        }
        const { read, type, limit } = request.query;
        const filters = {};
        if (read !== undefined) {
            filters.read = read === 'true';
        }
        if (type)
            filters.type = type;
        if (limit)
            filters.limit = parseInt(limit);
        const { alerts, unreadCount } = await alertService.getAlerts(request.userId, filters);
        return reply.send({
            success: true,
            data: { alerts, unreadCount },
        });
    }
    catch (error) {
        if (error instanceof ApiError) {
            return reply.status(error.statusCode).send({
                success: false,
                error: error.message,
            });
        }
        throw error;
    }
}
export async function markAsReadRoute(request, reply) {
    try {
        if (!request.userId) {
            return reply.status(401).send({
                success: false,
                error: 'Unauthorized',
            });
        }
        const { id } = request.params;
        const alert = await alertService.markAsRead(request.userId, id);
        return reply.send({
            success: true,
            data: { alert },
        });
    }
    catch (error) {
        if (error instanceof ApiError) {
            return reply.status(error.statusCode).send({
                success: false,
                error: error.message,
            });
        }
        throw error;
    }
}
export async function markAllAsReadRoute(request, reply) {
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
    }
    catch (error) {
        if (error instanceof ApiError) {
            return reply.status(error.statusCode).send({
                success: false,
                error: error.message,
            });
        }
        throw error;
    }
}
export async function deleteAlertRoute(request, reply) {
    try {
        if (!request.userId) {
            return reply.status(401).send({
                success: false,
                error: 'Unauthorized',
            });
        }
        const { id } = request.params;
        await alertService.deleteAlert(request.userId, id);
        return reply.send({
            success: true,
        });
    }
    catch (error) {
        if (error instanceof ApiError) {
            return reply.status(error.statusCode).send({
                success: false,
                error: error.message,
            });
        }
        throw error;
    }
}
export async function getAlertStatsRoute(request, reply) {
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
    }
    catch (error) {
        if (error instanceof ApiError) {
            return reply.status(error.statusCode).send({
                success: false,
                error: error.message,
            });
        }
        throw error;
    }
}
export async function alertRoutes(fastify) {
    fastify.addHook('onRequest', authMiddleware);
    fastify.get('/alerts', listAlertsRoute);
    fastify.put('/alerts/:id/read', markAsReadRoute);
    fastify.post('/alerts/mark-all-read', markAllAsReadRoute);
    fastify.delete('/alerts/:id', deleteAlertRoute);
    fastify.get('/alerts/stats', getAlertStatsRoute);
}
//# sourceMappingURL=alerts.js.map