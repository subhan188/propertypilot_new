import { propertyService } from '@/services/propertyService';
import { PropertySchema, UpdatePropertySchema } from '@/models/schemas';
import { ApiError } from '@/utils/errors';
import { authMiddleware } from '@/middleware/auth';
export async function listPropertiesRoute(request, reply) {
    try {
        if (!request.userId) {
            return reply.status(401).send({
                success: false,
                error: 'Unauthorized',
            });
        }
        const { type, status, city, page, pageSize } = request.query;
        const result = await propertyService.getProperties(request.userId, {
            type,
            status,
            city,
            page: page ? parseInt(page) : 1,
            pageSize: pageSize ? parseInt(pageSize) : 20,
        });
        return reply.send({
            success: true,
            data: result.data,
            total: result.total,
            page: result.page,
            pageSize: result.pageSize,
            hasMore: result.hasMore,
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
export async function getPropertyRoute(request, reply) {
    try {
        if (!request.userId) {
            return reply.status(401).send({
                success: false,
                error: 'Unauthorized',
            });
        }
        const { id } = request.params;
        const property = await propertyService.getPropertyById(request.userId, id);
        return reply.send({
            success: true,
            data: { property },
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
export async function createPropertyRoute(request, reply) {
    try {
        if (!request.userId) {
            return reply.status(401).send({
                success: false,
                error: 'Unauthorized',
            });
        }
        const body = PropertySchema.parse(request.body);
        const property = await propertyService.createProperty(request.userId, body);
        return reply.status(201).send({
            success: true,
            data: { property },
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
export async function updatePropertyRoute(request, reply) {
    try {
        if (!request.userId) {
            return reply.status(401).send({
                success: false,
                error: 'Unauthorized',
            });
        }
        const { id } = request.params;
        const body = UpdatePropertySchema.parse(request.body);
        const property = await propertyService.updateProperty(request.userId, id, body);
        return reply.send({
            success: true,
            data: { property },
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
export async function deletePropertyRoute(request, reply) {
    try {
        if (!request.userId) {
            return reply.status(401).send({
                success: false,
                error: 'Unauthorized',
            });
        }
        const { id } = request.params;
        const result = await propertyService.deleteProperty(request.userId, id);
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
export async function getPropertyMapDataRoute(request, reply) {
    try {
        if (!request.userId) {
            return reply.status(401).send({
                success: false,
                error: 'Unauthorized',
            });
        }
        const properties = await propertyService.getMapData(request.userId);
        return reply.send({
            success: true,
            data: { properties },
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
export async function propertyRoutes(fastify) {
    // Apply auth middleware to all property routes
    fastify.addHook('onRequest', authMiddleware);
    fastify.get('/properties', listPropertiesRoute);
    fastify.post('/properties', createPropertyRoute);
    fastify.get('/properties/:id', getPropertyRoute);
    fastify.put('/properties/:id', updatePropertyRoute);
    fastify.delete('/properties/:id', deletePropertyRoute);
    fastify.get('/properties/map/data', getPropertyMapDataRoute);
}
//# sourceMappingURL=properties.js.map