/**
 * Request Body Validation Middleware
 * Validates incoming requests against Zod schemas
 */
/**
 * Create a validation middleware for request body
 */
export function validateBody(schema) {
    return async (request, reply) => {
        try {
            const validated = schema.parse(request.body);
            request.validatedBody = validated;
        }
        catch (error) {
            return reply.code(400).send({
                success: false,
                error: 'Validation failed',
                details: error.errors || [{ message: error.message }],
            });
        }
    };
}
/**
 * Create a validation middleware for request params
 */
export function validateParams(schema) {
    return async (request, reply) => {
        try {
            const validated = schema.parse(request.params);
            request.validatedParams = validated;
        }
        catch (error) {
            return reply.code(400).send({
                success: false,
                error: 'Validation failed',
                details: error.errors || [{ message: error.message }],
            });
        }
    };
}
/**
 * Create a validation middleware for query parameters
 */
export function validateQuery(schema) {
    return async (request, reply) => {
        try {
            const validated = schema.parse(request.query);
            request.validatedQuery = validated;
        }
        catch (error) {
            return reply.code(400).send({
                success: false,
                error: 'Validation failed',
                details: error.errors || [{ message: error.message }],
            });
        }
    };
}
//# sourceMappingURL=validation.js.map