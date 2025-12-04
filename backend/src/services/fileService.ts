import { prisma } from '@/db/prisma';
import { s3Service, S3Service } from '@/utils/s3';
import { NotFoundError } from '@/utils/errors';

/**
 * File upload service for handling property and renovation photos
 */
export class FileService {
  /**
   * Upload a single file
   * @param userId - User ID
   * @param propertyId - Property ID (optional)
   * @param renovationId - Renovation ID (optional)
   * @param filename - Original filename
   * @param buffer - File buffer
   * @param mimeType - MIME type
   * @returns FileUpload object with signed URL
   */
  async uploadFile(
    userId: string,
    propertyId: string | undefined,
    renovationId: string | undefined,
    filename: string,
    buffer: Buffer,
    mimeType: string
  ) {
    // Verify property belongs to user
    if (propertyId) {
      const property = await prisma.property.findFirst({
        where: { id: propertyId, userId },
      });

      if (!property) {
        throw new NotFoundError('Property');
      }
    }

    // Verify renovation belongs to user if provided
    if (renovationId) {
      const renovation = await prisma.renovationItem.findUnique({
        where: { id: renovationId },
        include: { property: { select: { userId: true } } },
      });

      if (!renovation || renovation.property.userId !== userId) {
        throw new NotFoundError('Renovation');
      }
    }

    // Generate S3 key
    const resource = renovationId ? 'renovations' : 'properties';
    const resourceId = (renovationId || propertyId || userId) as string;
    const s3Key = S3Service.generateKey(resource, resourceId, filename);

    // Upload to S3
    const { key, signedUrl, expiresAt } = await s3Service.uploadFile(
      s3Key,
      buffer,
      mimeType
    );

    // Save to database
    const fileUpload = await prisma.fileUpload.create({
      data: {
        propertyId: propertyId ? propertyId : null,
        renovationId: renovationId ? renovationId : null,
        originalName: filename,
        mimeType,
        size: buffer.length,
        s3Key: key,
        signedUrl,
        signedUrlExpiresAt: expiresAt,
      },
    });

    return fileUpload;
  }

  /**
   * Get files for a property
   * @param userId - User ID
   * @param propertyId - Property ID
   * @returns Array of FileUpload objects
   */
  async getPropertyFiles(userId: string, propertyId: string) {
    // Verify property belongs to user
    const property = await prisma.property.findFirst({
      where: { id: propertyId, userId },
    });

    if (!property) {
      throw new NotFoundError('Property');
    }

    return prisma.fileUpload.findMany({
      where: { propertyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get files for a renovation
   * @param userId - User ID
   * @param renovationId - Renovation ID
   * @returns Array of FileUpload objects
   */
  async getRenovationFiles(userId: string, renovationId: string) {
    // Verify renovation belongs to user
    const renovation = await prisma.renovationItem.findUnique({
      where: { id: renovationId },
      include: { property: { select: { userId: true } } },
    });

    if (!renovation || renovation.property.userId !== userId) {
      throw new NotFoundError('Renovation');
    }

    return prisma.fileUpload.findMany({
      where: { renovationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Delete a file
   * @param userId - User ID
   * @param fileId - File ID
   */
  async deleteFile(userId: string, fileId: string) {
    const file = await prisma.fileUpload.findUnique({
      where: { id: fileId },
      include: {
        property: { select: { userId: true } },
        renovation: { include: { property: { select: { userId: true } } } },
      },
    });

    if (!file) {
      throw new NotFoundError('File');
    }

    // Verify user owns the resource
    const resourceUserId = file.property?.userId || file.renovation?.property.userId;
    if (resourceUserId !== userId) {
      throw new NotFoundError('File');
    }

    // Delete from S3
    await s3Service.deleteFile(file.s3Key);

    // Delete from database
    await prisma.fileUpload.delete({
      where: { id: fileId },
    });

    return { success: true };
  }

  /**
   * Refresh signed URL for a file
   * @param userId - User ID
   * @param fileId - File ID
   * @returns Updated FileUpload with new signed URL
   */
  async refreshSignedUrl(userId: string, fileId: string) {
    const file = await prisma.fileUpload.findUnique({
      where: { id: fileId },
      include: {
        property: { select: { userId: true } },
        renovation: { include: { property: { select: { userId: true } } } },
      },
    });

    if (!file) {
      throw new NotFoundError('File');
    }

    // Verify user owns the resource
    const resourceUserId = file.property?.userId || file.renovation?.property.userId;
    if (resourceUserId !== userId) {
      throw new NotFoundError('File');
    }

    // Get new signed URL
    const { url, expiresAt } = await s3Service.getSignedUrl(file.s3Key);

    // Update in database
    const updated = await prisma.fileUpload.update({
      where: { id: fileId },
      data: {
        signedUrl: url,
        signedUrlExpiresAt: expiresAt,
      },
    });

    return updated;
  }

}

export const fileService = new FileService();
