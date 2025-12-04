/**
 * Zillow Data API Routes
 * Integrates HasData Zillow API for real estate data
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@/db/prisma';
import { getHasDataClient, type SearchFilters } from '@/utils/hasDataClient';
import { ValidationError, NotFoundError } from '@/utils/errors';

/**
 * Search Zillow listings
 * POST /api/zillow/search
 */
async function searchZillowListings(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const body = request.body as {
    keyword: string;
    minPrice?: number;
    maxPrice?: number;
    minBeds?: number;
    maxBeds?: number;
    minBaths?: number;
    maxBaths?: number;
    minSqft?: number;
    maxSqft?: number;
  };
  const userId = request.session.userId as string;
  const { keyword, ...filters } = body;

  try {
    if (!keyword || keyword.trim().length < 2) {
      throw new ValidationError({
        keyword: 'Must be at least 2 characters',
      });
    }

    const client = getHasDataClient();

    // Check if API is enabled
    if (!client.hasQuotaAvailable()) {
      return reply.code(429).send({
        success: false,
        error: 'Zillow API quota exceeded. Please try again later.',
      });
    }

    // Search Zillow listings
    const searchFilters: SearchFilters = {
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minBeds: filters.minBeds,
      maxBeds: filters.maxBeds,
      minBaths: filters.minBaths,
      maxBaths: filters.maxBaths,
      minSqft: filters.minSqft,
      maxSqft: filters.maxSqft,
    };

    const listings = await client.searchListings(keyword, searchFilters);

    // Get usage stats
    const usage = client.getUsageStats();

    return reply.send({
      success: true,
      data: {
        listings: listings.map((listing) => ({
          zpid: listing.zpid,
          address: listing.address,
          city: listing.city,
          state: listing.state,
          zipCode: listing.zipCode,
          price: listing.price,
          beds: listing.beds,
          baths: listing.baths,
          sqft: listing.sqft,
          latitude: listing.latitude,
          longitude: listing.longitude,
          propertyType: listing.propertyType,
          zestimate: listing.zestimate,
          status: listing.status,
          photoLinks: listing.photoLinks,
          url: listing.url,
        })),
        count: listings.length,
        apiUsage: {
          quotaRemaining: usage.quotaRemaining,
          quotaPercentage: client.getQuotaPercentage(),
        },
      },
    });
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return reply.code(400).send({
        success: false,
        error: error.message,
        details: error.details,
      });
    }

    reply.server.log.error(error);
    return reply.code(500).send({
      success: false,
      error: 'Failed to search Zillow listings',
    });
  }
}

/**
 * Get detailed property information from Zillow
 * POST /api/zillow/property-details
 */
async function getZillowPropertyDetails(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.session.userId as string;
  const { zpidOrUrl } = request.body as { zpidOrUrl: string };

  try {
    if (!zpidOrUrl || zpidOrUrl.trim().length === 0) {
      throw new ValidationError({
        zpidOrUrl: 'ZPID or Zillow URL is required',
      });
    }

    const client = getHasDataClient();

    // Check quota
    if (!client.hasQuotaAvailable()) {
      return reply.code(429).send({
        success: false,
        error: 'Zillow API quota exceeded. Please try again later.',
      });
    }

    // Fetch property details
    const propertyDetails = await client.getPropertyDetails(zpidOrUrl);

    // Normalize data
    const normalized = client.normalizePropertyData(propertyDetails);

    // Get usage stats
    const usage = client.getUsageStats();

    return reply.send({
      success: true,
      data: {
        property: normalized,
        apiUsage: {
          quotaRemaining: usage.quotaRemaining,
          quotaPercentage: client.getQuotaPercentage(),
        },
      },
    });
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return reply.code(400).send({
        success: false,
        error: error.message,
        details: error.details,
      });
    }

    reply.server.log.error(error);
    return reply.code(500).send({
      success: false,
      error: 'Failed to fetch property details',
    });
  }
}

/**
 * Import Zillow property to portfolio
 * POST /api/zillow/import
 */
async function importZillowProperty(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.session.userId as string;
  const { zpidOrUrl, type = 'flip', notes } = request.body as {
    zpidOrUrl: string;
    type?: 'rent' | 'flip' | 'airbnb';
    notes?: string;
  };

  try {
    if (!zpidOrUrl || zpidOrUrl.trim().length === 0) {
      throw new ValidationError({
        zpidOrUrl: 'ZPID or Zillow URL is required',
      });
    }

    const client = getHasDataClient();

    if (!client.hasQuotaAvailable()) {
      return reply.code(429).send({
        success: false,
        error: 'Zillow API quota exceeded. Please try again later.',
      });
    }

    // Fetch property details from Zillow
    const propertyDetails = await client.getPropertyDetails(zpidOrUrl);
    const normalized = client.normalizePropertyData(propertyDetails);

    // Check if property already exists in portfolio
    const existing = await prisma.property.findUnique({
      where: { zpid: normalized.zpid },
    });

    if (existing) {
      return reply.code(409).send({
        success: false,
        error: 'Property already in your portfolio',
        data: {
          propertyId: existing.id,
        },
      });
    }

    // Create property in database
    const createdProperty = await prisma.property.create({
      data: {
        userId,
        address: normalized.addressLine1,
        city: normalized.addressCity,
        state: normalized.addressState,
        zipCode: normalized.addressZip,
        type,
        status: 'lead',
        purchasePrice: normalized.price,
        currentValue: normalized.zestimate || normalized.price,
        arv: normalized.zestimate || normalized.price,
        sqft: normalized.sqft,
        bedrooms: normalized.beds,
        bathrooms: normalized.baths,
        yearBuilt: normalized.yearBuilt,
        lotSize: normalized.lotSize,
        latitude: normalized.lat,
        longitude: normalized.lng,

        // Zillow fields
        zpid: normalized.zpid,
        zestimate: normalized.zestimate,
        rentZestimate: normalized.rentZestimate,
        taxAssessment: normalized.taxAssessment,
        taxYear: normalized.taxYear,
        priceHistory: normalized.priceHistory,
        rentalEstimateHistory: normalized.rentalEstimateHistory,
        photos: normalized.photos,
        zillowUrl: normalized.url,
        zillowStatus: normalized.status,
        lastFetched: new Date(),
        notes,
      },
    });

    return reply.code(201).send({
      success: true,
      data: {
        property: {
          id: createdProperty.id,
          address: createdProperty.address,
          city: createdProperty.city,
          state: createdProperty.state,
          zpid: createdProperty.zpid,
          price: createdProperty.purchasePrice,
          zestimate: createdProperty.zestimate,
          status: createdProperty.status,
          type: createdProperty.type,
          createdAt: createdProperty.createdAt,
        },
      },
    });
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return reply.code(400).send({
        success: false,
        error: error.message,
        details: error.details,
      });
    }

    reply.server.log.error(error);
    return reply.code(500).send({
      success: false,
      error: 'Failed to import property',
    });
  }
}

/**
 * Refresh Zillow data for a property
 * POST /api/zillow/refresh/:propertyId
 */
async function refreshZillowData(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.session.userId as string;
  const { propertyId } = request.params as { propertyId: string };

  try {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundError('Property');
    }

    if (property.userId !== userId) {
      return reply.code(403).send({
        success: false,
        error: 'Forbidden',
      });
    }

    if (!property.zpid) {
      return reply.code(400).send({
        success: false,
        error: 'Property is not linked to Zillow data',
      });
    }

    const client = getHasDataClient();

    if (!client.hasQuotaAvailable()) {
      return reply.code(429).send({
        success: false,
        error: 'Zillow API quota exceeded',
      });
    }

    // Fetch latest data
    const propertyDetails = await client.getPropertyDetails(property.zpid);
    const normalized = client.normalizePropertyData(propertyDetails);

    // Update property with fresh data
    const updated = await prisma.property.update({
      where: { id: propertyId },
      data: {
        zestimate: normalized.zestimate,
        rentZestimate: normalized.rentZestimate,
        taxAssessment: normalized.taxAssessment,
        taxYear: normalized.taxYear,
        priceHistory: normalized.priceHistory,
        rentalEstimateHistory: normalized.rentalEstimateHistory,
        photos: normalized.photos,
        zillowStatus: normalized.status,
        lastFetched: new Date(),
        currentValue: normalized.zestimate,
      },
    });

    return reply.send({
      success: true,
      data: {
        property: {
          id: updated.id,
          zpid: updated.zpid,
          zestimate: updated.zestimate,
          lastFetched: updated.lastFetched,
        },
      },
    });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      return reply.code(404).send({
        success: false,
        error: error.message,
      });
    }

    reply.server.log.error(error);
    return reply.code(500).send({
      success: false,
      error: 'Failed to refresh property data',
    });
  }
}

/**
 * Get API usage statistics
 * GET /api/zillow/usage
 */
async function getAPIUsageStats(request: FastifyRequest, reply: FastifyReply) {
  try {
    const client = getHasDataClient();
    const usage = client.getUsageStats();
    const quotaPercentage = client.getQuotaPercentage();

    return reply.send({
      success: true,
      data: {
        usage: {
          totalRequests: usage.totalRequests,
          requestsToday: usage.requestsToday,
          quotaRemaining: usage.quotaRemaining,
          quotaTotal: usage.quota,
          quotaPercentage,
          quotaPercentageRemaining: 100 - quotaPercentage,
          lastRequestTime: usage.lastRequestTime,
          hasQuota: client.hasQuotaAvailable(),
        },
      },
    });
  } catch (error: any) {
    reply.server.log.error(error);
    return reply.code(500).send({
      success: false,
      error: 'Failed to get API usage statistics',
    });
  }
}

/**
 * Register Zillow routes
 */
export async function zillowRoutes(fastify: FastifyInstance) {
  // Search listings
  fastify.post('/api/zillow/search', searchZillowListings);

  // Get property details
  fastify.post('/api/zillow/property-details', getZillowPropertyDetails);

  // Import property to portfolio
  fastify.post('/api/zillow/import', importZillowProperty);

  // Refresh property data
  fastify.post('/api/zillow/refresh/:propertyId', refreshZillowData);

  // Get API usage stats
  fastify.get('/api/zillow/usage', getAPIUsageStats);
}
