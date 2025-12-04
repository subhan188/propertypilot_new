/**
 * Sync AirBnB Data Job Handler
 * Updates AirBnB market data and scenarios for properties
 */

import { prisma } from '@/db/prisma';
import { mockAdapter } from '@/adapters/mockAdapter';
import { RealEstateAdapterFactory } from '@/adapters/realEstateAdapter';
import { SyncAirbnbDataJobData, JobResult } from '../types';

export async function syncAirbnbDataHandler(data: SyncAirbnbDataJobData): Promise<JobResult> {
  const { propertyId, userId, city, state } = data;

  try {
    // Verify property exists and belongs to user
    const property = await prisma.property.findFirst({
      where: { id: propertyId, userId },
    });

    if (!property) {
      throw new Error(`Property ${propertyId} not found for user ${userId}`);
    }

    // Get available adapter (prefer real adapters, fallback to mock)
    const availableAdapters = await RealEstateAdapterFactory.getAvailableAdapters();
    const adapter = availableAdapters.length > 0 ? availableAdapters[0] : mockAdapter;

    // Fetch AirBnB market data
    const airbnbData = await adapter.getAirbnbMarketData(city, state);

    // Find or create Airbnb scenario for this property
    let scenario = await prisma.dealScenario.findFirst({
      where: {
        propertyId,
        exitStrategy: 'airbnb',
      },
    });

    if (!scenario) {
      // Create new Airbnb scenario with fetched data
      scenario = await prisma.dealScenario.create({
        data: {
          propertyId,
          name: 'AirBnB Market Data',
          purchasePrice: property.purchasePrice,
          dailyRate: Math.round(airbnbData.averageDailyRate),
          averageOccupancy: Math.round(airbnbData.averageOccupancy),
          exitStrategy: 'airbnb',
          interestRate: 5.5,
          holdTimeMonths: 60,
          monthlyRent: 0,
          occupancyRate: 100,
          rehabCost: 0,
          closingCosts: 0,
          holdingCosts: 0,
          sellingCosts: 0,
        },
      });
    } else {
      // Update existing scenario with new market data
      scenario = await prisma.dealScenario.update({
        where: { id: scenario.id },
        data: {
          dailyRate: Math.round(airbnbData.averageDailyRate),
          averageOccupancy: Math.round(airbnbData.averageOccupancy),
        },
      });
    }

    // Calculate projected monthly income
    const daysPerMonth = (airbnbData.averageOccupancy / 100) * 30;
    const monthlyIncome = Math.round(airbnbData.averageDailyRate * daysPerMonth);

    return {
      success: true,
      data: {
        scenarioId: scenario.id,
        averageDailyRate: airbnbData.averageDailyRate,
        averageOccupancy: airbnbData.averageOccupancy,
        projectedMonthlyIncome: monthlyIncome,
        totalListings: airbnbData.totalListings,
        source: adapter.constructor.name,
      },
      processedAt: new Date(),
    };
  } catch (error: any) {
    console.error(`SyncAirbnbData job failed for property ${data.propertyId}:`, error);
    return {
      success: false,
      error: error.message,
      processedAt: new Date(),
    };
  }
}
