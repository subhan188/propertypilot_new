import { fileService } from '@/services/fileService';
async function uploadFileHandler(request, reply) {
    const userId = request.session.userId;
    const { propertyId, renovationId } = request.query;
    if (!propertyId && !renovationId) {
        return reply.code(400).send({
            success: false,
            error: 'Either propertyId or renovationId is required',
        });
    }
    try {
        const data = await request.file();
        if (!data) {
            return reply.code(400).send({
                success: false,
                error: 'No file provided',
            });
        }
        const buffer = await data.toBuffer();
        const filename = data.filename;
        const mimeType = data.mimetype;
        const fileUpload = await fileService.uploadFile(userId, propertyId, renovationId, filename, buffer, mimeType);
        return reply.code(201).send({
            success: true,
            data: fileUpload,
        });
    }
    catch (error) {
        if (error.message.includes('not found')) {
            return reply.code(404).send({
                success: false,
                error: error.message,
            });
        }
        reply.server.log.error(error);
        return reply.code(500).send({
            success: false,
            error: 'Failed to upload file',
        });
    }
}
async function uploadBatchHandler(request, reply) {
    const userId = request.session.userId;
    const { propertyId, renovationId } = request.query;
    if (!propertyId && !renovationId) {
        return reply.code(400).send({
            success: false,
            error: 'Either propertyId or renovationId is required',
        });
    }
    try {
        const files = request.files();
        const uploadedFiles = [];
        for await (const file of files) {
            const buffer = await file.toBuffer();
            const filename = file.filename;
            const mimeType = file.mimetype;
            const fileUpload = await fileService.uploadFile(userId, propertyId, renovationId, filename, buffer, mimeType);
            uploadedFiles.push(fileUpload);
        }
        return reply.code(201).send({
            success: true,
            data: {
                files: uploadedFiles,
                count: uploadedFiles.length,
            },
        });
    }
    catch (error) {
        if (error.message.includes('not found')) {
            return reply.code(404).send({
                success: false,
                error: error.message,
            });
        }
        reply.server.log.error(error);
        return reply.code(500).send({
            success: false,
            error: 'Failed to upload files',
        });
    }
}
async function getPropertyFilesHandler(request, reply) {
    const userId = request.session.userId;
    const { propertyId } = request.params;
    try {
        const files = await fileService.getPropertyFiles(userId, propertyId);
        return reply.send({
            success: true,
            data: files,
        });
    }
    catch (error) {
        if (error.message.includes('not found')) {
            return reply.code(404).send({
                success: false,
                error: error.message,
            });
        }
        reply.server.log.error(error);
        return reply.code(500).send({
            success: false,
            error: 'Failed to retrieve files',
        });
    }
}
async function getRenovationFilesHandler(request, reply) {
    const userId = request.session.userId;
    const { renovationId } = request.params;
    try {
        const files = await fileService.getRenovationFiles(userId, renovationId);
        return reply.send({
            success: true,
            data: files,
        });
    }
    catch (error) {
        if (error.message.includes('not found')) {
            return reply.code(404).send({
                success: false,
                error: error.message,
            });
        }
        reply.server.log.error(error);
        return reply.code(500).send({
            success: false,
            error: 'Failed to retrieve files',
        });
    }
}
async function deleteFileHandler(request, reply) {
    const userId = request.session.userId;
    const { fileId } = request.params;
    try {
        await fileService.deleteFile(userId, fileId);
        return reply.send({
            success: true,
        });
    }
    catch (error) {
        if (error.message.includes('not found')) {
            return reply.code(404).send({
                success: false,
                error: error.message,
            });
        }
        reply.server.log.error(error);
        return reply.code(500).send({
            success: false,
            error: 'Failed to delete file',
        });
    }
}
async function refreshSignedUrlHandler(request, reply) {
    const userId = request.session.userId;
    const { fileId } = request.params;
    try {
        const file = await fileService.refreshSignedUrl(userId, fileId);
        return reply.send({
            success: true,
            data: file,
        });
    }
    catch (error) {
        if (error.message.includes('not found')) {
            return reply.code(404).send({
                success: false,
                error: error.message,
            });
        }
        reply.server.log.error(error);
        return reply.code(500).send({
            success: false,
            error: 'Failed to refresh URL',
        });
    }
}
export async function uploadRoutes(fastify) {
    fastify.post('/upload', uploadFileHandler);
    fastify.post('/upload/batch', uploadBatchHandler);
    fastify.get('/properties/:propertyId/files', getPropertyFilesHandler);
    fastify.get('/renovations/:renovationId/files', getRenovationFilesHandler);
    fastify.delete('/uploads/:fileId', deleteFileHandler);
    fastify.put('/uploads/:fileId/refresh-url', refreshSignedUrlHandler);
}
//# sourceMappingURL=uploads.js.map