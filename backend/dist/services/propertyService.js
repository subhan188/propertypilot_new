import { prisma } from '@/db/prisma';
import { NotFoundError, ValidationError } from '@/utils/errors';
export class PropertyService {
    async getProperties(userId, filters = {}) {
        const { type, status, city, page = 1, pageSize = 20 } = filters;
        const where = { userId };
        if (type)
            where.type = type;
        if (status)
            where.status = status;
        if (city)
            where.city = { contains: city, mode: 'insensitive' };
        const [properties, total] = await Promise.all([
            prisma.property.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.property.count({ where }),
        ]);
        return {
            data: properties,
            total,
            page,
            pageSize,
            hasMore: page * pageSize < total,
        };
    }
    async getPropertyById(userId, propertyId) {
        const property = await prisma.property.findFirst({
            where: { id: propertyId, userId },
            include: {
                scenarios: {
                    orderBy: { createdAt: 'desc' },
                },
                renovations: {
                    orderBy: { createdAt: 'desc' },
                },
                fileUploads: {
                    orderBy: { createdAt: 'desc' },
                },
                comps: {
                    orderBy: { saleDate: 'desc' },
                },
            },
        });
        if (!property) {
            throw new NotFoundError('Property');
        }
        return property;
    }
    async createProperty(userId, data) {
        // Validate required fields
        if (!data.address || !data.city || !data.state || !data.zipCode) {
            throw new ValidationError({
                address: 'Address is required',
                city: 'City is required',
                state: 'State is required',
                zipCode: 'Zip code is required',
            });
        }
        const property = await prisma.property.create({
            data: {
                userId,
                ...data,
            },
        });
        return property;
    }
    async updateProperty(userId, propertyId, data) {
        // Verify property exists and belongs to user
        const property = await prisma.property.findFirst({
            where: { id: propertyId, userId },
        });
        if (!property) {
            throw new NotFoundError('Property');
        }
        const updated = await prisma.property.update({
            where: { id: propertyId },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        });
        return updated;
    }
    async deleteProperty(userId, propertyId) {
        // Verify property exists and belongs to user
        const property = await prisma.property.findFirst({
            where: { id: propertyId, userId },
        });
        if (!property) {
            throw new NotFoundError('Property');
        }
        // Soft delete by marking as sold (keep data for records)
        await prisma.property.update({
            where: { id: propertyId },
            data: { status: 'sold' },
        });
        return { success: true };
    }
    async getMapData(userId) {
        const properties = await prisma.property.findMany({
            where: { userId },
            select: {
                id: true,
                address: true,
                latitude: true,
                longitude: true,
                type: true,
                currentValue: true,
                status: true,
            },
        });
        return properties;
    }
    async getPropertyStats(userId) {
        const properties = await prisma.property.findMany({
            where: { userId },
        });
        const stats = {
            total: properties.length,
            byType: {
                rent: properties.filter((p) => p.type === 'rent').length,
                airbnb: properties.filter((p) => p.type === 'airbnb').length,
                flip: properties.filter((p) => p.type === 'flip').length,
            },
            byStatus: {
                lead: properties.filter((p) => p.status === 'lead').length,
                analyzing: properties.filter((p) => p.status === 'analyzing').length,
                offer: properties.filter((p) => p.status === 'offer').length,
                under_contract: properties.filter((p) => p.status === 'under_contract').length,
                owned: properties.filter((p) => p.status === 'owned').length,
                sold: properties.filter((p) => p.status === 'sold').length,
            },
        };
        return stats;
    }
}
export const propertyService = new PropertyService();
//# sourceMappingURL=propertyService.js.map