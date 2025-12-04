import Fastify from 'fastify';
import fastifySession from '@fastify/session';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import { config } from '@/utils/config';
import { authRoutes } from '@/routes/auth';
import { propertyRoutes } from '@/routes/properties';
import { scenarioRoutes } from '@/routes/scenarios';
import { renovationRoutes } from '@/routes/renovations';
import { alertRoutes } from '@/routes/alerts';
import { dashboardRoutes } from '@/routes/dashboard';
import { uploadRoutes } from '@/routes/uploads';
import { analysisRoutes } from '@/routes/analysis';
import { quickCaptureRoutes } from '@/routes/quickCapture';
import { integrationRoutes } from '@/routes/integrations';
import { reportRoutes } from '@/routes/reports';
import { userRoutes } from '@/routes/user';
import { zillowRoutes } from '@/routes/zillow';
import { authMiddleware } from '@/middleware/auth';
import { registerAuditLogging } from '@/middleware/auditLog';
import { registerRateLimiting } from '@/middleware/rateLimit';
import { registerErrorHandler, registerRequestLogging, registerResponseTiming } from '@/middleware/errorHandler';

export async function createApp() {
  const fastify = Fastify({
    logger: {
      level: config.app.logLevel,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      },
    },
  });

  // Register plugins
  await fastify.register(fastifyCookie);

  await fastify.register(fastifyCors, {
    origin: config.cors.origin,
    credentials: true,
  });

  await fastify.register(fastifyMultipart, {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
    },
  });

  await fastify.register(fastifySession, {
    secret: config.session.secret,
    cookie: {
      httpOnly: true,
      secure: config.session.cookie.secure as boolean | 'auto',
      sameSite: config.session.cookie.sameSite as 'lax' | 'strict' | 'none',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  });

  // Register security and logging middleware
  registerErrorHandler(fastify);
  registerRequestLogging(fastify);
  registerResponseTiming(fastify);
  registerRateLimiting(fastify);
  registerAuditLogging(fastify);

  // Health check endpoint
  fastify.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Routes
  await fastify.register(authRoutes, { prefix: '/api' });
  await fastify.register(propertyRoutes, { prefix: '/api' });
  await fastify.register(scenarioRoutes, { prefix: '/api' });
  await fastify.register(renovationRoutes, { prefix: '/api' });
  await fastify.register(alertRoutes, { prefix: '/api' });
  await fastify.register(dashboardRoutes, { prefix: '/api' });
  await fastify.register(uploadRoutes, { prefix: '/api' });
  await fastify.register(analysisRoutes, { prefix: '/api' });
  await fastify.register(quickCaptureRoutes, { prefix: '/api' });
  await fastify.register(integrationRoutes);
  await fastify.register(reportRoutes);
  await fastify.register(userRoutes);
  await fastify.register(zillowRoutes);

  return fastify;
}
