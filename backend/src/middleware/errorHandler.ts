/**
 * Global Error Handler Middleware
 * Standardizes error responses across the application
 */

import { FastifyInstance, FastifyRequest, FastifyReply, FastifyError } from 'fastify';

/**
 * Custom application error classes
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(400, message, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(500, message);
  }
}

/**
 * Register error handler on Fastify app
 */
export function registerErrorHandler(fastify: FastifyInstance) {
  fastify.setErrorHandler(async (error: any, request: FastifyRequest, reply: FastifyReply) => {
    const requestId = request.id;

    // Log the error
    fastify.log.error({
      requestId,
      error: {
        name: error.name,
        message: error.message,
        statusCode: error.statusCode,
        stack: error.stack,
      },
      request: {
        method: request.method,
        url: request.url,
        ip: request.ip,
      },
    });

    // Handle custom AppError
    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({
        success: false,
        error: error.message,
        details: error.details,
        requestId,
      });
    }

    // Handle Fastify validation errors (query, params, body)
    if (error.statusCode === 400 && error.validation) {
      return reply.code(400).send({
        success: false,
        error: 'Validation failed',
        details: error.validation || [{ message: error.message }],
        requestId,
      });
    }

    // Handle Fastify errors
    if (error.statusCode && typeof error.statusCode === 'number') {
      return reply.code(error.statusCode).send({
        success: false,
        error: error.message,
        requestId,
      });
    }

    // Handle JSON parsing errors
    if (error.code === 'FST_ERR_CTP_BODY_TOO_LARGE') {
      return reply.code(413).send({
        success: false,
        error: 'Request payload too large',
        requestId,
      });
    }

    // Handle multipart errors
    if (error.code === 'FST_ERR_PARTS_LIMIT') {
      return reply.code(400).send({
        success: false,
        error: 'Too many file parts',
        requestId,
      });
    }

    // Generic error handler
    return reply.code(500).send({
      success: false,
      error: 'Internal server error',
      requestId,
      ...(process.env.NODE_ENV === 'development' && { message: error.message }),
    });
  });
}

/**
 * Request logging hook
 */
export function registerRequestLogging(fastify: FastifyInstance) {
  fastify.addHook('onRequest', async (request, reply) => {
    fastify.log.debug({
      requestId: request.id,
      method: request.method,
      url: request.url,
      ip: request.ip,
    });
  });
}

/**
 * Response time tracking hook
 */
export function registerResponseTiming(fastify: FastifyInstance) {
  fastify.addHook('onResponse', async (request, reply) => {
    fastify.log.debug({
      requestId: request.id,
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTime: `${reply.getResponseTime()}ms`,
    });
  });
}
