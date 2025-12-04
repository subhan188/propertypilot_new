/**
 * Request Body Validation Middleware
 * Validates incoming requests against Zod schemas
 */
import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodSchema } from 'zod';
export interface ValidatedRequest extends FastifyRequest {
    validatedBody?: Record<string, any>;
    validatedParams?: Record<string, any>;
    validatedQuery?: Record<string, any>;
}
/**
 * Create a validation middleware for request body
 */
export declare function validateBody(schema: ZodSchema): (request: ValidatedRequest, reply: FastifyReply) => Promise<undefined>;
/**
 * Create a validation middleware for request params
 */
export declare function validateParams(schema: ZodSchema): (request: ValidatedRequest, reply: FastifyReply) => Promise<undefined>;
/**
 * Create a validation middleware for query parameters
 */
export declare function validateQuery(schema: ZodSchema): (request: ValidatedRequest, reply: FastifyReply) => Promise<undefined>;
//# sourceMappingURL=validation.d.ts.map