/**
 * Global Error Handler Middleware
 * Standardizes error responses across the application
 */
import { FastifyInstance } from 'fastify';
/**
 * Custom application error classes
 */
export declare class AppError extends Error {
    statusCode: number;
    message: string;
    details?: Record<string, any> | undefined;
    constructor(statusCode: number, message: string, details?: Record<string, any> | undefined);
}
export declare class NotFoundError extends AppError {
    constructor(resource: string);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
export declare class ValidationError extends AppError {
    constructor(message: string, details?: Record<string, any>);
}
export declare class ConflictError extends AppError {
    constructor(message: string);
}
export declare class InternalServerError extends AppError {
    constructor(message?: string);
}
/**
 * Register error handler on Fastify app
 */
export declare function registerErrorHandler(fastify: FastifyInstance): void;
/**
 * Request logging hook
 */
export declare function registerRequestLogging(fastify: FastifyInstance): void;
/**
 * Response time tracking hook
 */
export declare function registerResponseTiming(fastify: FastifyInstance): void;
//# sourceMappingURL=errorHandler.d.ts.map