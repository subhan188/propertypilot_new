import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { scenarioService } from '@/services/scenarioService';
import { DealScenarioSchema, UpdateDealScenarioSchema } from '@/models/schemas';
import { ApiError } from '@/utils/errors';
import { authMiddleware } from '@/middleware/auth';

export async function listScenariosRoute(request: FastifyRequest, reply: FastifyReply) {
  try {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: 'Unauthorized',
      });
    }

    const { propertyId } = request.params as { propertyId: string };
    const scenarios = await scenarioService.getScenarios(request.userId, propertyId);

    return reply.send({
      success: true,
      data: { scenarios },
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

export async function createScenarioRoute(request: FastifyRequest, reply: FastifyReply) {
  try {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: 'Unauthorized',
      });
    }

    const { propertyId } = request.params as { propertyId: string };
    const body = DealScenarioSchema.parse(request.body);
    const scenario = await scenarioService.createScenario(request.userId, propertyId, body);

    return reply.status(201).send({
      success: true,
      data: { scenario },
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

export async function updateScenarioRoute(request: FastifyRequest, reply: FastifyReply) {
  try {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: 'Unauthorized',
      });
    }

    const { id } = request.params as { id: string };
    const body = UpdateDealScenarioSchema.parse(request.body);
    const scenario = await scenarioService.updateScenario(request.userId, id, body);

    return reply.send({
      success: true,
      data: { scenario },
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

export async function deleteScenarioRoute(request: FastifyRequest, reply: FastifyReply) {
  try {
    if (!request.userId) {
      return reply.status(401).send({
        success: false,
        error: 'Unauthorized',
      });
    }

    const { id } = request.params as { id: string };
    await scenarioService.deleteScenario(request.userId, id);

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

export async function scenarioRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', authMiddleware);

  fastify.get<{ Params: { propertyId: string } }>(
    '/properties/:propertyId/scenarios',
    listScenariosRoute
  );
  fastify.post<{ Params: { propertyId: string }; Body: any }>(
    '/properties/:propertyId/scenarios',
    createScenarioRoute
  );
  fastify.put<{ Params: { id: string }; Body: any }>(
    '/scenarios/:id',
    updateScenarioRoute
  );
  fastify.delete<{ Params: { id: string } }>(
    '/scenarios/:id',
    deleteScenarioRoute
  );
}
