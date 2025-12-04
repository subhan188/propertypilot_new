/**
 * User Account & Data Management Routes
 * Handles user profile, preferences, GDPR/CCPA compliance
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@/db/prisma';
import { s3Service } from '@/utils/s3';
import { NotFoundError, ValidationError } from '@/utils/errors';
import bcrypt from 'bcryptjs';

async function getUserProfile(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.session.userId as string;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return reply.send({
      success: true,
      data: { user },
    });
  } catch (error: any) {
    reply.server.log.error(error);
    return reply.code(500).send({
      success: false,
      error: 'Failed to fetch user profile',
    });
  }
}

async function updateUserProfile(
  request: FastifyRequest<{ Body: any }>,
  reply: FastifyReply
) {
  const userId = request.session.userId as string;
  const body = request.body as any;
  const { name, avatar } = body;

  try {
    if (!name && !avatar) {
      throw new ValidationError({
        name: 'At least one field must be provided',
      });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
      },
    });

    return reply.send({
      success: true,
      data: { user: updated },
    });
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return reply.code(400).send({
        success: false,
        error: error.message,
        details: error.details,
      });
    }

    reply.server.log.error(error);
    return reply.code(500).send({
      success: false,
      error: 'Failed to update profile',
    });
  }
}

async function getUserPreferences(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.session.userId as string;

  try {
    const prefs = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    if (!prefs) {
      // Return default preferences if not set
      return reply.send({
        success: true,
        data: {
          preferences: {
            currency: 'USD',
            timezone: 'America/New_York',
            propertyTypes: ['rent', 'flip', 'airbnb'],
            propertyStatuses: ['lead', 'analyzing', 'offer', 'under_contract', 'owned'],
          },
        },
      });
    }

    return reply.send({
      success: true,
      data: { preferences: prefs },
    });
  } catch (error: any) {
    reply.server.log.error(error);
    return reply.code(500).send({
      success: false,
      error: 'Failed to fetch preferences',
    });
  }
}

async function updateUserPreferences(
  request: FastifyRequest<{ Body: any }>,
  reply: FastifyReply
) {
  const userId = request.session.userId as string;
  const body = request.body as any;
  const { currency, timezone, propertyTypes, propertyStatuses } = body;

  try {
    const existing = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    if (existing) {
      const updated = await prisma.userPreferences.update({
        where: { userId },
        data: {
          currency: currency || existing.currency,
          timezone: timezone || existing.timezone,
          propertyTypes: propertyTypes || existing.propertyTypes,
          propertyStatuses: propertyStatuses || existing.propertyStatuses,
        },
      });

      return reply.send({
        success: true,
        data: { preferences: updated },
      });
    } else {
      const created = await prisma.userPreferences.create({
        data: {
          userId,
          currency: currency || 'USD',
          timezone: timezone || 'America/New_York',
          propertyTypes: propertyTypes || ['rent', 'flip', 'airbnb'],
          propertyStatuses:
            propertyStatuses || ['lead', 'analyzing', 'offer', 'under_contract', 'owned'],
        },
      });

      return reply.code(201).send({
        success: true,
        data: { preferences: created },
      });
    }
  } catch (error: any) {
    reply.server.log.error(error);
    return reply.code(500).send({
      success: false,
      error: 'Failed to update preferences',
    });
  }
}

async function exportUserData(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.session.userId as string;

  try {
    // Collect all user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const properties = await prisma.property.findMany({
      where: { userId },
    });

    const scenarios = await prisma.dealScenario.findMany({
      where: { property: { userId } },
    });

    const renovations = await prisma.renovationItem.findMany({
      where: { property: { userId } },
    });

    const fileUploads = await prisma.fileUpload.findMany({
      where: { property: { userId } },
    });

    const alerts = await prisma.alert.findMany({
      where: { userId },
    });

    const comps = await prisma.comp.findMany({
      where: { property: { userId } },
    });

    const preferences = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    const integrations = await prisma.integration.findMany({
      where: { userId },
      select: {
        id: true,
        service: true,
        isActive: true,
        lastSyncAt: true,
        syncStatus: true,
      },
    });

    const exportData = {
      exportedAt: new Date().toISOString(),
      user,
      properties,
      scenarios,
      renovations,
      fileUploads,
      alerts,
      comps,
      preferences,
      integrations,
    };

    reply.header('Content-Type', 'application/json');
    reply.header('Content-Disposition', 'attachment; filename="user-data-export.json"');
    return reply.send(exportData);
  } catch (error: any) {
    reply.server.log.error(error);
    return reply.code(500).send({
      success: false,
      error: 'Failed to export user data',
    });
  }
}

async function deleteUserAccount(
  request: FastifyRequest<{ Body: any }>,
  reply: FastifyReply
) {
  const userId = request.session.userId as string;
  const body = request.body as any;
  const { password } = body;

  try {
    if (!password) {
      throw new ValidationError({
        password: 'Password is required to delete account',
      });
    }

    // Verify password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new ValidationError({
        password: 'Invalid password',
      });
    }

    // Delete user files from S3
    const fileUploads = await prisma.fileUpload.findMany({
      where: { property: { userId } },
    });

    for (const file of fileUploads) {
      try {
        await s3Service.deleteFile(file.s3Key);
      } catch (error) {
        // Continue even if S3 deletion fails
        console.warn(`Failed to delete S3 file: ${file.s3Key}`);
      }
    }

    // Delete all user data (cascade delete handles most relationships)
    await prisma.user.delete({
      where: { id: userId },
    });

    // Clear session
    request.session.destroy((err) => {
      if (err) {
        reply.server.log.error('Failed to destroy session:', err);
      }
    });

    return reply.send({
      success: true,
      data: {
        message: 'Account deleted successfully. All your data has been removed.',
      },
    });
  } catch (error: any) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      return reply.code(400).send({
        success: false,
        error: error.message,
        details: error instanceof ValidationError ? error.details : undefined,
      });
    }

    reply.server.log.error(error);
    return reply.code(500).send({
      success: false,
      error: 'Failed to delete account',
    });
  }
}

export async function userRoutes(fastify: FastifyInstance) {
  fastify.get('/api/user/me', getUserProfile);

  fastify.put<{ Body: any }>('/api/user/me', updateUserProfile);

  fastify.get('/api/user/preferences', getUserPreferences);

  fastify.put<{ Body: any }>('/api/user/preferences', updateUserPreferences);

  fastify.get('/api/user/export-data', exportUserData);

  fastify.post<{ Body: any }>('/api/user/delete-account', deleteUserAccount);
}
