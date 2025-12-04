/**
 * Refresh Property Comps Job Handler
 * Updates comparable sales data for properties
 */

import { prisma } from '@/db/prisma';
import { mockAdapter } from '@/adapters/mockAdapter';
import { RealEstateAdapterFactory } from '@/adapters/realEstateAdapter';
import { RefreshPropertyCompsJobData, JobResult } from '../types';

export async function refreshPropertyCompsHandler(
  data: RefreshPropertyCompsJobData
): Promise<JobResult> {
  const { propertyId, userId, radius = 1 } = data;

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

    // Fetch comparables
    const comparables = await adapter.getComparables(
      property.address,
      property.city,
      property.state,
      property.sqft || 1000,
      radius
    );

    if (!comparables || comparables.length === 0) {
      return {
        success: false,
        error: 'No comparables found',
        processedAt: new Date(),
      };
    }

    // Delete old comps for this property
    await prisma.comp.deleteMany({
      where: { propertyId },
    });

    // Create new comps
    const createdComps = await Promise.all(
      comparables.map((comp) =>
        prisma.comp.create({
          data: {
            propertyId,
            address: comp.address,
            salePrice: comp.salePrice,
            pricePerSqft: comp.pricePerSqft,
            saleDate: comp.saleDate,
            beds: comp.beds,
            baths: comp.baths,
            sqft: comp.sqft,
            source: comp.source,
            externalId: comp.externalId,
          },
        })
      )
    );

    // Calculate updated ARV based on new comps
    const pricePerSqftValues = createdComps.map((c) => c.pricePerSqft);
    const medianPricePerSqft =
      pricePerSqftValues.length > 0
        ? pricePerSqftValues.sort((a, b) => a - b)[Math.floor(pricePerSqftValues.length / 2)]
        : property.arv / (property.sqft || 1000);

    const estimatedArv = (property.sqft || 1000) * medianPricePerSqft;

    // Update property with new ARV
    await prisma.property.update({
      where: { id: propertyId },
      data: { arv: Math.round(estimatedArv) },
    });

    return {
      success: true,
      data: {
        comparablesCount: createdComps.length,
        estimatedArv: Math.round(estimatedArv),
        source: adapter.constructor.name,
      },
      processedAt: new Date(),
    };
  } catch (error: any) {
    console.error(`RefreshPropertyComps job failed for property ${data.propertyId}:`, error);
    return {
      success: false,
      error: error.message,
      processedAt: new Date(),
    };
  }
}
