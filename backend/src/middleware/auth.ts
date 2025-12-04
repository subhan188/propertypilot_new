import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  if (!request.session.userId) {
    return reply.status(401).send({
      success: false,
      error: 'Unauthorized',
    });
  }
  request.userId = request.session.userId;
}

export async function optionalAuthMiddleware(request: FastifyRequest, reply: FastifyReply) {
  if (request.session.userId) {
    request.userId = request.session.userId;
  }
}
