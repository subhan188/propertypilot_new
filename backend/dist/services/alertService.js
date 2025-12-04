import { prisma } from '@/db/prisma';
import { NotFoundError } from '@/utils/errors';
export class AlertService {
    async getAlerts(userId, filters = {}) {
        const { read, type, limit = 50 } = filters;
        const where = { userId };
        if (read !== undefined)
            where.read = read;
        if (type)
            where.type = type;
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
    async markAsRead(userId, alertId) {
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
    async markAllAsRead(userId) {
        await prisma.alert.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
        return { success: true };
    }
    async deleteAlert(userId, alertId) {
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
    async createAlert(userId, data) {
        const alert = await prisma.alert.create({
            data: {
                userId,
                ...data,
            },
        });
        return alert;
    }
    async getAlertStats(userId) {
        const [total, unread, byType] = await Promise.all([
            prisma.alert.count({ where: { userId } }),
            prisma.alert.count({ where: { userId, read: false } }),
            prisma.alert.groupBy({
                by: ['type'],
                where: { userId },
                _count: { id: true },
            }),
        ]);
        const typeBreakdown = byType.reduce((acc, item) => {
            acc[item.type] = item._count.id;
            return acc;
        }, {});
        return {
            total,
            unread,
            byType: typeBreakdown,
        };
    }
}
export const alertService = new AlertService();
//# sourceMappingURL=alertService.js.map