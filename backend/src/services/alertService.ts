import { prisma } from '@/db/prisma';
import { NotFoundError } from '@/utils/errors';

export interface CreateAlertInput {
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  propertyId?: string;
}

export class AlertService {
  async getAlerts(
    userId: string,
    filters: {
      read?: boolean;
      type?: string;
      limit?: number;
    } = {}
  ) {
    const { read, type, limit = 50 } = filters;

    const where: any = { userId };
    if (read !== undefined) where.read = read;
    if (type) where.type = type;

    const [alerts, unreadCount] = await Promise.all([
      prisma.alert.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.alert.count({
        where: { userId, read: false },
      }),
    ]);

    return { alerts, unreadCount };
  }

  async markAsRead(userId: string, alertId: string) {
    const alert = await prisma.alert.findFirst({
      where: { id: alertId, userId },
    });

    if (!alert) {
      throw new NotFoundError('Alert');
    }

    const updated = await prisma.alert.update({
      where: { id: alertId },
      data: { read: true },
    });

    return updated;
  }

  async markAllAsRead(userId: string) {
    await prisma.alert.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return { success: true };
  }

  async deleteAlert(userId: string, alertId: string) {
    const alert = await prisma.alert.findFirst({
      where: { id: alertId, userId },
    });

    if (!alert) {
      throw new NotFoundError('Alert');
    }

    await prisma.alert.delete({
      where: { id: alertId },
    });

    return { success: true };
  }

  async createAlert(userId: string, data: CreateAlertInput) {
    const alert = await prisma.alert.create({
      data: {
        userId,
        ...data,
      },
    });

    return alert;
  }

  async getAlertStats(userId: string) {
    const [total, unread, byType] = await Promise.all([
      prisma.alert.count({ where: { userId } }),
      prisma.alert.count({ where: { userId, read: false } }),
      prisma.alert.groupBy({
        by: ['type'],
        where: { userId },
        _count: { id: true },
      }),
    ]);

    const typeBreakdown = byType.reduce(
      (acc: Record<string, number>, item: any) => {
        acc[item.type] = item._count.id;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      total,
      unread,
      byType: typeBreakdown,
    };
  }
}

export const alertService = new AlertService();
