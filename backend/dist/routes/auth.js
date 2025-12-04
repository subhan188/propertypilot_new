import { authService } from '@/services/authService';
import { RegisterSchema, LoginSchema, ChangePasswordSchema } from '@/models/schemas';
import { ApiError } from '@/utils/errors';
export async function registerRoute(request, reply) {
    try {
        const body = RegisterSchema.parse(request.body);
        const user = await authService.register(body);
        return reply.status(201).send({
            success: true,
            data: { user },
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
export async function loginRoute(request, reply) {
    try {
        const body = LoginSchema.parse(request.body);
        const user = await authService.login(body);
        // Set session
        request.session.userId = user.id;
        return reply.send({
            success: true,
            data: { user },
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
export async function logoutRoute(request, reply) {
    request.session.destroy((err) => {
        if (err) {
            return reply.status(500).send({
                success: false,
                error: 'Failed to logout',
            });
        }
        return reply.send({
            success: true,
        });
    });
}
export async function meRoute(request, reply) {
    try {
        if (!request.userId) {
            return reply.status(401).send({
                success: false,
                error: 'Unauthorized',
            });
        }
        const user = await authService.getUserById(request.userId);
        return reply.send({
            success: true,
            data: { user },
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
export async function changePasswordRoute(request, reply) {
    try {
        if (!request.userId) {
            return reply.status(401).send({
                success: false,
                error: 'Unauthorized',
            });
        }
        const body = ChangePasswordSchema.parse(request.body);
        await authService.changePassword(request.userId, body.currentPassword, body.newPassword);
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
export async function authRoutes(fastify) {
    fastify.post('/auth/register', registerRoute);
    fastify.post('/auth/login', loginRoute);
    fastify.post('/auth/logout', logoutRoute);
    fastify.get('/auth/me', meRoute);
    fastify.put('/auth/password', changePasswordRoute);
}
//# sourceMappingURL=auth.js.map