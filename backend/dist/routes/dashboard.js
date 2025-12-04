import { dashboardService } from '@/services/dashboardService';
import { authMiddleware } from '@/middleware/auth';
export async function getKPIRoute(request, reply) {
    try {
        if (!request.userId) {
            return reply.status(401).send({
                success: false,
                error: 'Unauthorized',
            });
        }
        const kpi = await dashboardService.getKPI(request.userId);
        return reply.send({
            success: true,
            data: { kpi },
        });
    }
    catch (error) {
        throw error;
    }
}
export async function getPortfolioTrendRoute(request, reply) {
    try {
        if (!request.userId) {
            return reply.status(401).send({
                success: false,
                error: 'Unauthorized',
            });
        }
        const { days } = request.query;
        const data = await dashboardService.getPortfolioTrend(request.userId, days ? parseInt(days) : 90);
        return reply.send({
            success: true,
            data: { trend: data },
        });
    }
    catch (error) {
        throw error;
    }
}
export async function getDealFlowRoute(request, reply) {
    try {
        if (!request.userId) {
            return reply.status(401).send({
                success: false,
                error: 'Unauthorized',
            });
        }
        const dealFlow = await dashboardService.getDealFlow(request.userId);
        return reply.send({
            success: true,
            data: { dealFlow },
        });
    }
    catch (error) {
        throw error;
    }
}
export async function getPropertyTypesRoute(request, reply) {
    try {
        if (!request.userId) {
            return reply.status(401).send({
                success: false,
                error: 'Unauthorized',
            });
        }
        const breakdown = await dashboardService.getPropertyTypes(request.userId);
        return reply.send({
            success: true,
            data: { breakdown },
        });
    }
    catch (error) {
        throw error;
    }
}
export async function getRecentActivityRoute(request, reply) {
    try {
        if (!request.userId) {
            return reply.status(401).send({
                success: false,
                error: 'Unauthorized',
            });
        }
        const { limit } = request.query;
        const activity = await dashboardService.getRecentActivity(request.userId, limit ? parseInt(limit) : 10);
        return reply.send({
            success: true,
            data: { activity },
        });
    }
    catch (error) {
        throw error;
    }
}
export async function dashboardRoutes(fastify) {
    fastify.addHook('onRequest', authMiddleware);
    fastify.get('/dashboard/kpi', getKPIRoute);
    fastify.get('/dashboard/portfolio-trend', getPortfolioTrendRoute);
    fastify.get('/dashboard/deal-flow', getDealFlowRoute);
    fastify.get('/dashboard/property-types', getPropertyTypesRoute);
    fastify.get('/dashboard/recent-activity', getRecentActivityRoute);
}
//# sourceMappingURL=dashboard.js.map