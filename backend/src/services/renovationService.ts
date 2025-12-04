import { prisma } from '@/db/prisma';
import { NotFoundError } from '@/utils/errors';
import type { RenovationItemInput } from '@/models/schemas';

export class RenovationService {
  async getRenovations(userId: string, propertyId: string, filters?: { status?: string }) {
    // Verify property belongs to user
    const property = await prisma.property.findFirst({
      where: { id: propertyId, userId },
    });

    if (!property) {
      throw new NotFoundError('Property');
    }

    const where: any = { propertyId };
    if (filters?.status) {
      where.status = filters.status;
    }

    const renovations = await prisma.renovationItem.findMany({
      where,
      include: {
        photos: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return renovations;
  }

  async createRenovation(userId: string, propertyId: string, data: RenovationItemInput) {
    // Verify property belongs to user
    const property = await prisma.property.findFirst({
      where: { id: propertyId, userId },
    });

    if (!property) {
      throw new NotFoundError('Property');
    }

    const renovation = await prisma.renovationItem.create({
      data: {
        propertyId,
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
      include: {
        photos: true,
      },
    });

    return renovation;
  }

  async updateRenovation(
    userId: string,
    renovationId: string,
    data: Partial<RenovationItemInput>
  ) {
    // Verify renovation exists and belongs to user's property
    const renovation = await prisma.renovationItem.findUnique({
      where: { id: renovationId },
      include: { property: { select: { userId: true } } },
    });

    if (!renovation || renovation.property.userId !== userId) {
      throw new NotFoundError('Renovation');
    }

    const updateData: any = { ...data };
    if (data.startDate) {
      updateData.startDate = new Date(data.startDate);
    }
    if (data.endDate) {
      updateData.endDate = new Date(data.endDate);
    }

    const updated = await prisma.renovationItem.update({
      where: { id: renovationId },
      data: updateData,
      include: {
        photos: true,
      },
    });

    return updated;
  }

  async deleteRenovation(userId: string, renovationId: string) {
    // Verify renovation exists and belongs to user's property
    const renovation = await prisma.renovationItem.findUnique({
      where: { id: renovationId },
      include: { property: { select: { userId: true } } },
    });

    if (!renovation || renovation.property.userId !== userId) {
      throw new NotFoundError('Renovation');
    }

    // Delete associated file uploads first
    await prisma.fileUpload.deleteMany({
      where: { renovationId },
    });

    await prisma.renovationItem.delete({
      where: { id: renovationId },
    });

    return { success: true };
  }

  async getRenovationStats(userId: string, propertyId: string) {
    // Verify property belongs to user
    const property = await prisma.property.findFirst({
      where: { id: propertyId, userId },
    });

    if (!property) {
      throw new NotFoundError('Property');
    }

    const renovations = await prisma.renovationItem.findMany({
      where: { propertyId },
    });

    const stats = {
      total: renovations.length,
      byStatus: {
        pending: renovations.filter((r: any) => r.status === 'pending').length,
        in_progress: renovations.filter((r: any) => r.status === 'in_progress').length,
        completed: renovations.filter((r: any) => r.status === 'completed').length,
      },
      estimatedTotal: renovations.reduce((sum: number, r: any) => sum + r.estimatedCost, 0),
      actualTotal: renovations.reduce((sum: number, r: any) => sum + (r.actualCost || 0), 0),
      percentComplete:
        renovations.length > 0
          ? (renovations.filter((r: any) => r.status === 'completed').length / renovations.length) * 100
          : 0,
    };

    return stats;
  }
}

export const renovationService = new RenovationService();
