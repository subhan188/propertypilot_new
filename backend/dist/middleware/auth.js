export async function authMiddleware(request, reply) {
    if (!request.session.userId) {
        return reply.status(401).send({
            success: false,
            error: 'Unauthorized',
        });
    }
    request.userId = request.session.userId;
}
export async function optionalAuthMiddleware(request, reply) {
    if (request.session.userId) {
        request.userId = request.session.userId;
    }
}
//# sourceMappingURL=auth.js.map