import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { fileService } from '@/services/fileService';

async function uploadFileHandler(
  request: FastifyRequest<{
    Querystring: { propertyId?: string; renovationId?: string };
  }>,
  reply: FastifyReply
) {
  const userId = request.session.userId as string;
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

    const fileUpload = await fileService.uploadFile(
      userId,
      propertyId,
      renovationId,
      filename,
      buffer,
      mimeType
    );

    return reply.code(201).send({
      success: true,
      data: fileUpload,
    });
  } catch (error: any) {
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

async function uploadBatchHandler(
  request: FastifyRequest<{
    Querystring: { propertyId?: string; renovationId?: string };
  }>,
  reply: FastifyReply
) {
  const userId = request.session.userId as string;
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

      const fileUpload = await fileService.uploadFile(
        userId,
        propertyId,
        renovationId,
        filename,
        buffer,
        mimeType
      );

      uploadedFiles.push(fileUpload);
    }

    return reply.code(201).send({
      success: true,
      data: {
        files: uploadedFiles,
        count: uploadedFiles.length,
      },
    });
  } catch (error: any) {
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

async function getPropertyFilesHandler(
  request: FastifyRequest<{ Params: { propertyId: string } }>,
  reply: FastifyReply
) {
  const userId = request.session.userId as string;
  const { propertyId } = request.params;

  try {
    const files = await fileService.getPropertyFiles(userId, propertyId);

    return reply.send({
      success: true,
      data: files,
    });
  } catch (error: any) {
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

async function getRenovationFilesHandler(
  request: FastifyRequest<{ Params: { renovationId: string } }>,
  reply: FastifyReply
) {
  const userId = request.session.userId as string;
  const { renovationId } = request.params;

  try {
    const files = await fileService.getRenovationFiles(userId, renovationId);

    return reply.send({
      success: true,
      data: files,
    });
  } catch (error: any) {
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

async function deleteFileHandler(
  request: FastifyRequest<{ Params: { fileId: string } }>,
  reply: FastifyReply
) {
  const userId = request.session.userId as string;
  const { fileId } = request.params;

  try {
    await fileService.deleteFile(userId, fileId);

    return reply.send({
      success: true,
    });
  } catch (error: any) {
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

async function refreshSignedUrlHandler(
  request: FastifyRequest<{ Params: { fileId: string } }>,
  reply: FastifyReply
) {
  const userId = request.session.userId as string;
  const { fileId } = request.params;

  try {
    const file = await fileService.refreshSignedUrl(userId, fileId);

    return reply.send({
      success: true,
      data: file,
    });
  } catch (error: any) {
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

export async function uploadRoutes(fastify: FastifyInstance) {
  fastify.post<{ Querystring: { propertyId?: string; renovationId?: string } }>(
    '/upload',
    uploadFileHandler
  );

  fastify.post<{ Querystring: { propertyId?: string; renovationId?: string } }>(
    '/upload/batch',
    uploadBatchHandler
  );

  fastify.get<{ Params: { propertyId: string } }>(
    '/properties/:propertyId/files',
    getPropertyFilesHandler
  );

  fastify.get<{ Params: { renovationId: string } }>(
    '/renovations/:renovationId/files',
    getRenovationFilesHandler
  );

  fastify.delete<{ Params: { fileId: string } }>(
    '/uploads/:fileId',
    deleteFileHandler
  );

  fastify.put<{ Params: { fileId: string } }>(
    '/uploads/:fileId/refresh-url',
    refreshSignedUrlHandler
  );
}
