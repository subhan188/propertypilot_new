/**
 * Rate Limiting Middleware
 * Prevents API abuse by limiting requests per user/IP
 */
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
export interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    keyGenerator?: (request: FastifyRequest) => string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
}
/**
 * Create rate limit middleware
 */
export declare function createRateLimiter(config: RateLimitConfig): (request: FastifyRequest, reply: FastifyReply) => Promise<undefined>;
/**
 * Register rate limiting middleware on routes
 */
export declare function registerRateLimiting(fastify: FastifyInstance): void;
/**
 * Reset rate limit for a user (admin only)
 */
export declare function resetRateLimit(userId: string, prefix?: string): Promise<void>;
/**
 * Get current rate limit status
 */
export declare function getRateLimitStatus(userId: string, prefix?: string): Promise<{
    remaining: number;
    limit: number;
    resetTime: Date;
}>;
/**
 * Cleanup: Close Redis connection
 */
export declare function closeRateLimiter(): Promise<void>;
//# sourceMappingURL=rateLimit.d.ts.map