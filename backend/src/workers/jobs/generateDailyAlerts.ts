/**
 * Generate Daily Alerts Job Handler
 * Creates alerts for user properties based on market conditions and thresholds
 */

import { prisma } from '@/db/prisma';
import { mockAdapter } from '@/adapters/mockAdapter';
import { RealEstateAdapterFactory } from '@/adapters/realEstateAdapter';
import { GenerateDailyAlertsJobData, JobResult } from '../types';

export async function generateDailyAlertsHandler(
  data: GenerateDailyAlertsJobData
): Promise<JobResult> {
  const { userId } = data;

  try {
    // Get user's properties
    const properties = await prisma.property.findMany({
      where: { userId },
      include: {
        scenarios: true,
      },
    });

    if (!properties || properties.length === 0) {
      return {
        success: true,
        data: {
          alertsGenerated: 0,
          message: 'No properties found for user',
        },
        processedAt: new Date(),
      };
    }

    // Get available adapter
    const availableAdapters = await RealEstateAdapterFactory.getAvailableAdapters();
    const adapter = availableAdapters.length > 0 ? availableAdapters[0] : mockAdapter;

    let alertsCreated = 0;
    const alerts: string[] = [];

    // Analyze each property
    for (const property of properties) {
      try {
        // Get market trends
        const trends = await adapter.getMarketTrends(property.city, property.state);

        // Check for significant price changes (>5%)
        const priceTrend = trends.find((t) => t.metric === 'average_price');
        if (priceTrend && Math.abs(priceTrend.percentChange) > 5) {
          const direction = priceTrend.trend === 'up' ? 'increasing' : 'decreasing';
          const message = `Market prices in ${property.city}, ${property.state} are ${direction} (${Math.abs(priceTrend.percentChange).toFixed(1)}%)`;

          await prisma.alert.create({
            data: {
              userId,
              type: 'market-trend',
              title: 'Market Price Trend Alert',
              message,
              propertyId: property.id,
              read: false,
            },
          });

          alerts.push(message);
          alertsCreated++;
        }

        // Check for fast-moving markets (low days on market)
        const domTrend = trends.find((t) => t.metric === 'median_days_on_market');
        if (domTrend && domTrend.value < 20) {
          const message = `${property.city}, ${property.state} is a fast-moving market (${Math.round(domTrend.value)} days on market)`;

          // Only create alert if we haven't created one in the last 7 days
          const existingAlert = await prisma.alert.findFirst({
            where: {
              userId,
              propertyId: property.id,
              title: 'Hot Market Alert',
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          });

          if (!existingAlert) {
            await prisma.alert.create({
              data: {
                userId,
                type: 'market-alert',
                title: 'Hot Market Alert',
                message,
                propertyId: property.id,
                read: false,
              },
            });

            alerts.push(message);
            alertsCreated++;
          }
        }

        // Check for cap rate opportunities (if rental scenario exists)
        const rentalScenario = property.scenarios.find((s) => s.exitStrategy === 'rent');
        if (rentalScenario && rentalScenario.capRate && rentalScenario.capRate > 8) {
          const message = `Strong rental opportunity: ${property.address} has projected cap rate of ${rentalScenario.capRate}%`;

          await prisma.alert.create({
            data: {
              userId,
              type: 'investment-alert',
              title: 'Investment Opportunity',
              message,
              propertyId: property.id,
              read: false,
            },
          });

          alerts.push(message);
          alertsCreated++;
        }
      } catch (propertyError: any) {
        console.warn(`Failed to generate alerts for property ${property.id}:`, propertyError.message);
      }
    }

    return {
      success: true,
      data: {
        alertsGenerated: alertsCreated,
        propertiesAnalyzed: properties.length,
        alerts,
        source: adapter.constructor.name,
      },
      processedAt: new Date(),
    };
  } catch (error: any) {
    console.error(`GenerateDailyAlerts job failed for user ${data.userId}:`, error);
    return {
      success: false,
      error: error.message,
      processedAt: new Date(),
    };
  }
}
