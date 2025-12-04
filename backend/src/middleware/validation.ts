/**
 * Request Body Validation Middleware
 * Validates incoming requests against Zod schemas
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ZodSchema } from 'zod';

export interface ValidatedRequest extends FastifyRequest {
  validatedBody?: Record<string, any>;
  validatedParams?: Record<string, any>;
  validatedQuery?: Record<string, any>;
}

/**
 * Create a validation middleware for request body
 */
export function validateBody(schema: ZodSchema) {
  return async (request: ValidatedRequest, reply: FastifyReply) => {
    try {
      const validated = schema.parse(request.body);
      request.validatedBody = validated;
    } catch (error: any) {
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
export function validateParams(schema: ZodSchema) {
  return async (request: ValidatedRequest, reply: FastifyReply) => {
    try {
      const validated = schema.parse(request.params);
      request.validatedParams = validated;
    } catch (error: any) {
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
export function validateQuery(schema: ZodSchema) {
  return async (request: ValidatedRequest, reply: FastifyReply) => {
    try {
      const validated = schema.parse(request.query);
      request.validatedQuery = validated;
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        error: 'Validation failed',
        details: error.errors || [{ message: error.message }],
      });
    }
  };
}
