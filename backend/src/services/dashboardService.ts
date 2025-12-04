import { prisma } from '@/db/prisma';

export class DashboardService {
  async getKPI(userId: string) {
    const properties = await prisma.property.findMany({
      where: { userId },
    });

    const scenarios = await prisma.dealScenario.findMany({
      where: {
        property: { userId },
      },
    });

    // Calculate portfolio value
    const portfolioValue = properties.reduce((sum: number, p: any) => sum + p.currentValue, 0);

    // Calculate total monthly NOI (from owned rental/airbnb properties)
    const monthlyCashflow = scenarios
      .filter((s: any) => s.exitStrategy !== 'flip' && s.propertyId)
      .reduce((sum: number, s: any) => sum + (s.monthlyNOI || 0), 0);

    // Calculate equity (assuming 75% LTV on average)
    const availableEquity = portfolioValue * 0.25; // Simplified: 25% equity

    // Count properties by status
    const ownedProperties = properties.filter((p: any) => p.status === 'owned').length;
    const activeDeals = properties.filter(
      (p: any) => ['analyzing', 'offer', 'under_contract'].includes(p.status)
    ).length;

    const kpi = {
      portfolioValue: Math.round(portfolioValue * 100) / 100,
      portfolioValueChange: 8.5, // Mock for now, could calculate from historical data
      monthlyCashflow: Math.round(monthlyCashflow * 100) / 100,
      cashflowChange: 12.3, // Mock for now
      availableEquity: Math.round(availableEquity * 100) / 100,
      equityChange: 15.2, // Mock for now
      totalProperties: properties.length,
      activeDeals,
    };

    return kpi;
  }

  async getPortfolioTrend(userId: string, days: number = 90) {
    const properties = await prisma.property.findMany({
      where: { userId },
    });

    // Generate mock trend data based on portfolio value
    const currentValue = properties.reduce((sum: number, p: any) => sum + p.currentValue, 0);
    const baselineValue = currentValue * 0.92; // Assume 8% appreciation over period

    const data = [];
    const now = new Date();

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Linear appreciation
      const value = baselineValue + (currentValue - baselineValue) * (1 - i / days);

      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(value * 100) / 100,
        change: i === days ? 0 : ((value - baselineValue) / baselineValue) * 100,
      });
    }

    return data;
  }

  async getDealFlow(userId: string) {
    const properties = await prisma.property.findMany({
      where: { userId },
    });

    const dealFlow = {
      leads: properties.filter((p: any) => p.status === 'lead').length,
      analyzing: properties.filter((p: any) => p.status === 'analyzing').length,
      offers: properties.filter((p: any) => p.status === 'offer').length,
      under_contract: properties.filter((p: any) => p.status === 'under_contract').length,
      owned: properties.filter((p: any) => p.status === 'owned').length,
      sold: properties.filter((p: any) => p.status === 'sold').length,
    };

    return dealFlow;
  }

  async getPropertyTypes(userId: string) {
    const properties = await prisma.property.findMany({
      where: { userId },
    });

    const breakdown = {
      rent: {
        count: properties.filter((p: any) => p.type === 'rent').length,
        value: properties
          .filter((p: any) => p.type === 'rent')
          .reduce((sum: number, p: any) => sum + p.currentValue, 0),
      },
      airbnb: {
        count: properties.filter((p: any) => p.type === 'airbnb').length,
        value: properties
          .filter((p: any) => p.type === 'airbnb')
          .reduce((sum: number, p: any) => sum + p.currentValue, 0),
      },
      flip: {
        count: properties.filter((p: any) => p.type === 'flip').length,
        value: properties
          .filter((p: any) => p.type === 'flip')
          .reduce((sum: number, p: any) => sum + p.currentValue, 0),
      },
    };

    return breakdown;
  }

  async getRecentActivity(userId: string, limit: number = 10) {
    const [recentProperties, recentScenarios, recentRenovations] = await Promise.all([
      prisma.property.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        select: { id: true, address: true, updatedAt: true, type: true },
      }),
      prisma.dealScenario.findMany({
        where: { property: { userId } },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        select: { id: true, name: true, updatedAt: true, propertyId: true },
      }),
      prisma.renovationItem.findMany({
        where: { property: { userId } },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        select: { id: true, category: true, updatedAt: true, status: true },
      }),
    ]);

    // Merge and sort by date
    const activity = [
      ...recentProperties.map((p: any) => ({
        type: 'property',
        name: p.address,
        timestamp: p.updatedAt,
      })),
      ...recentScenarios.map((s: any) => ({
        type: 'scenario',
        name: s.name,
        timestamp: s.updatedAt,
      })),
      ...recentRenovations.map((r: any) => ({
        type: 'renovation',
        name: r.category,
        timestamp: r.updatedAt,
      })),
    ]
      .sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    return activity;
  }
}

export const dashboardService = new DashboardService();
