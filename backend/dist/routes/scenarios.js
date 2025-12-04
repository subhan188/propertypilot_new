import { scenarioService } from '@/services/scenarioService';
import { DealScenarioSchema, UpdateDealScenarioSchema } from '@/models/schemas';
import { ApiError } from '@/utils/errors';
import { authMiddleware } from '@/middleware/auth';
export async function listScenariosRoute(request, reply) {
    try {
        if (!request.userId) {
            return reply.status(401).send({
                success: false,
                error: 'Unauthorized',
            });
        }
        const { propertyId } = request.params;
        const scenarios = await scenarioService.getScenarios(request.userId, propertyId);
        return reply.send({
            success: true,
            data: { scenarios },
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
export async function createScenarioRoute(request, reply) {
    try {
        if (!request.userId) {
            return reply.status(401).send({
                success: false,
                error: 'Unauthorized',
            });
        }
        const { propertyId } = request.params;
        const body = DealScenarioSchema.parse(request.body);
        const scenario = await scenarioService.createScenario(request.userId, propertyId, body);
        return reply.status(201).send({
            success: true,
            data: { scenario },
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
export async function updateScenarioRoute(request, reply) {
    try {
        if (!request.userId) {
            return reply.status(401).send({
                success: false,
                error: 'Unauthorized',
            });
        }
        const { id } = request.params;
        const body = UpdateDealScenarioSchema.parse(request.body);
        const scenario = await scenarioService.updateScenario(request.userId, id, body);
        return reply.send({
            success: true,
            data: { scenario },
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
export async function deleteScenarioRoute(request, reply) {
    try {
        if (!request.userId) {
            return reply.status(401).send({
                success: false,
                error: 'Unauthorized',
            });
        }
        const { id } = request.params;
        await scenarioService.deleteScenario(request.userId, id);
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
export async function scenarioRoutes(fastify) {
    fastify.addHook('onRequest', authMiddleware);
    fastify.get('/properties/:propertyId/scenarios', listScenariosRoute);
    fastify.post('/properties/:propertyId/scenarios', createScenarioRoute);
    fastify.put('/scenarios/:id', updateScenarioRoute);
    fastify.delete('/scenarios/:id', deleteScenarioRoute);
}
//# sourceMappingURL=scenarios.js.map