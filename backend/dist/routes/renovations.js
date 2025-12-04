import { renovationService } from '@/services/renovationService';
import { RenovationItemSchema, UpdateRenovationItemSchema } from '@/models/schemas';
import { ApiError } from '@/utils/errors';
import { authMiddleware } from '@/middleware/auth';
export async function listRenovationsRoute(request, reply) {
    try {
        if (!request.userId) {
            return reply.status(401).send({
                success: false,
                error: 'Unauthorized',
            });
        }
        const { propertyId } = request.params;
        const { status } = request.query;
        const renovations = await renovationService.getRenovations(request.userId, propertyId, {
            status,
        });
        return reply.send({
            success: true,
            data: { renovations },
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
export async function createRenovationRoute(request, reply) {
    try {
        if (!request.userId) {
            return reply.status(401).send({
                success: false,
                error: 'Unauthorized',
            });
        }
        const { propertyId } = request.params;
        const body = RenovationItemSchema.parse(request.body);
        const renovation = await renovationService.createRenovation(request.userId, propertyId, body);
        return reply.status(201).send({
            success: true,
            data: { renovation },
        });
    }
    catch (error) {
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
export async function updateRenovationRoute(request, reply) {
    try {
        if (!request.userId) {
            return reply.status(401).send({
                success: false,
                error: 'Unauthorized',
            });
        }
        const { id } = request.params;
        const body = UpdateRenovationItemSchema.parse(request.body);
        const renovation = await renovationService.updateRenovation(request.userId, id, body);
        return reply.send({
            success: true,
            data: { renovation },
        });
    }
    catch (error) {
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
export async function deleteRenovationRoute(request, reply) {
    try {
        if (!request.userId) {
            return reply.status(401).send({
                success: false,
                error: 'Unauthorized',
            });
        }
        const { id } = request.params;
        await renovationService.deleteRenovation(request.userId, id);
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
export async function getRenovationStatsRoute(request, reply) {
    try {
        if (!request.userId) {
            return reply.status(401).send({
                success: false,
                error: 'Unauthorized',
            });
        }
        const { propertyId } = request.params;
        const stats = await renovationService.getRenovationStats(request.userId, propertyId);
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
export async function renovationRoutes(fastify) {
    fastify.addHook('onRequest', authMiddleware);
    fastify.get('/properties/:propertyId/renovations', listRenovationsRoute);
    fastify.post('/properties/:propertyId/renovations', createRenovationRoute);
    fastify.put('/renovations/:id', updateRenovationRoute);
    fastify.delete('/renovations/:id', deleteRenovationRoute);
    fastify.get('/properties/:propertyId/renovations/stats', getRenovationStatsRoute);
}
//# sourceMappingURL=renovations.js.map