import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
export declare function registerRoute(request: FastifyRequest, reply: FastifyReply): Promise<never>;
export declare function loginRoute(request: FastifyRequest, reply: FastifyReply): Promise<never>;
export declare function logoutRoute(request: FastifyRequest, reply: FastifyReply): Promise<void>;
export declare function meRoute(request: FastifyRequest, reply: FastifyReply): Promise<never>;
export declare function changePasswordRoute(request: FastifyRequest, reply: FastifyReply): Promise<never>;
export declare function authRoutes(fastify: FastifyInstance): Promise<void>;
//# sourceMappingURL=auth.d.ts.map