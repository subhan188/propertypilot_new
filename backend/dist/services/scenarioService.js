import { prisma } from '@/db/prisma';
import { NotFoundError } from '@/utils/errors';
export class ScenarioService {
    async getScenarios(userId, propertyId) {
        // Verify property belongs to user
        const property = await prisma.property.findFirst({
            where: { id: propertyId, userId },
        });
        if (!property) {
            throw new NotFoundError('Property');
        }
        const scenarios = await prisma.dealScenario.findMany({
            where: { propertyId },
            orderBy: { createdAt: 'desc' },
        });
        return scenarios;
    }
    async createScenario(userId, propertyId, data) {
        // Verify property belongs to user
        const property = await prisma.property.findFirst({
            where: { id: propertyId, userId },
        });
        if (!property) {
            throw new NotFoundError('Property');
        }
        const scenario = await prisma.dealScenario.create({
            data: {
                propertyId,
                ...data,
            },
        });
        return scenario;
    }
    async updateScenario(userId, scenarioId, data) {
        // Verify scenario exists and belongs to user's property
        const scenario = await prisma.dealScenario.findUnique({
            where: { id: scenarioId },
            include: { property: { select: { userId: true } } },
        });
        if (!scenario || scenario.property.userId !== userId) {
            throw new NotFoundError('Scenario');
        }
        const updated = await prisma.dealScenario.update({
            where: { id: scenarioId },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        });
        return updated;
    }
    async deleteScenario(userId, scenarioId) {
        // Verify scenario exists and belongs to user's property
        const scenario = await prisma.dealScenario.findUnique({
            where: { id: scenarioId },
            include: { property: { select: { userId: true } } },
        });
        if (!scenario || scenario.property.userId !== userId) {
            throw new NotFoundError('Scenario');
        }
        await prisma.dealScenario.delete({
            where: { id: scenarioId },
        });
        return { success: true };
    }
}
export const scenarioService = new ScenarioService();
//# sourceMappingURL=scenarioService.js.map