/**
 * Rate Limiting Middleware
 * Prevents API abuse by limiting requests per user/IP
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import Redis from 'ioredis';
import { config } from '@/utils/config';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyGenerator?: (request: FastifyRequest) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

const redisClient = new Redis({
  host: config.redis.host || 'localhost',
  port: config.redis.port || 6379,
});

/**
 * Default rate limit configurations
 */
const DEFAULT_LIMITS = {
  global: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000, // 1000 requests per 15 minutes
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
  },
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  },
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 uploads per hour
  },
};

/**
 * Generate rate limit key
 */
function generateKey(request: FastifyRequest, prefix: string): string {
  const userId = (request.session?.userId as string) || request.ip;
  return `ratelimit:${prefix}:${userId}`;
}

/**
 * Create rate limit middleware
 */
export function createRateLimiter(config: RateLimitConfig) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const key = config.keyGenerator
        ? config.keyGenerator(request)
        : generateKey(request, 'api');

      const current = await redisClient.incr(key);

      // Set expiry on first request
      if (current === 1) {
        await redisClient.pexpire(key, config.windowMs);
      }

      // Set headers
      reply.header('X-RateLimit-Limit', config.maxRequests.toString());
      reply.header('X-RateLimit-Remaining', Math.max(0, config.maxRequests - current).toString());
      reply.header('X-RateLimit-Reset', new Date(Date.now() + config.windowMs).toISOString());

      // Check if limit exceeded
      if (current > config.maxRequests) {
        return reply.code(429).send({
          success: false,
          error: 'Too many requests',
          retryAfter: Math.ceil(config.windowMs / 1000),
        });
      }
    } catch (error) {
      // Log error but don't fail the request
      console.warn('Rate limit check failed:', error);
    }
  };
}

/**
 * Register rate limiting middleware on routes
 */
export function registerRateLimiting(fastify: FastifyInstance) {
  // Global rate limit
  fastify.addHook('onRequest', createRateLimiter(DEFAULT_LIMITS.global));

  // Auth endpoints - stricter limit
  fastify.addHook('onRequest', async (request, reply) => {
    if (request.url.includes('/api/auth/') && (request.method === 'POST')) {
      await createRateLimiter(DEFAULT_LIMITS.auth)(request, reply);
    }
  });

  // Upload endpoints - per-hour limit
  fastify.addHook('onRequest', async (request, reply) => {
    if (request.url.includes('/api/upload') && request.method === 'POST') {
      await createRateLimiter(DEFAULT_LIMITS.upload)(request, reply);
    }
  });
}

/**
 * Reset rate limit for a user (admin only)
 */
export async function resetRateLimit(userId: string, prefix: string = 'api'): Promise<void> {
  const key = `ratelimit:${prefix}:${userId}`;
  await redisClient.del(key);
}

/**
 * Get current rate limit status
 */
export async function getRateLimitStatus(
  userId: string,
  prefix: string = 'api'
): Promise<{
  remaining: number;
  limit: number;
  resetTime: Date;
}> {
  const key = `ratelimit:${prefix}:${userId}`;
  const current = parseInt((await redisClient.get(key)) || '0', 10);
  const ttl = await redisClient.pttl(key);

  const config = DEFAULT_LIMITS.api;
  return {
    remaining: Math.max(0, config.maxRequests - current),
    limit: config.maxRequests,
    resetTime: new Date(Date.now() + (ttl > 0 ? ttl : 0)),
  };
}

/**
 * Cleanup: Close Redis connection
 */
export async function closeRateLimiter() {
  await redisClient.quit();
}
