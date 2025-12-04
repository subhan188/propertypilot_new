/**
 * Zillow/HasData API Service
 * Handles all Zillow property search and import operations
 */

import { apiClient } from './apiClient';
import { ZillowProperty, ZillowUsage } from '@/types/api';

export interface ZillowSearchParams {
  keyword: string;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  maxBeds?: number;
  minBaths?: number;
  maxBaths?: number;
  minSqft?: number;
  maxSqft?: number;
}

export interface ZillowSearchResponse {
  listings: ZillowProperty[];
  count: number;
  apiUsage: {
    quotaRemaining: number;
    quotaPercentage: number;
  };
}

export interface ZillowPropertyDetailsResponse {
  property: any;
  apiUsage: {
    quotaRemaining: number;
    quotaPercentage: number;
  };
}

export interface ZillowImportResponse {
  property: {
    id: string;
    address: string;
    city: string;
    state: string;
    zpid: string;
    price: number;
    zestimate: number;
    status: string;
    type: string;
    createdAt: string;
  };
}

/**
 * Search Zillow listings by keyword and filters
 */
export async function searchZillowListings(
  params: ZillowSearchParams
): Promise<ZillowSearchResponse | null> {
  try {
    const response = await apiClient.post<ZillowSearchResponse>(
      '/zillow/search',
      params
    );
    return response.data || null;
  } catch (error) {
    console.error('Error searching Zillow listings:', error);
    return null;
  }
}

/**
 * Get detailed information about a specific Zillow property
 */
export async function getZillowPropertyDetails(
  zpidOrUrl: string
): Promise<ZillowPropertyDetailsResponse | null> {
  try {
    const response = await apiClient.post<ZillowPropertyDetailsResponse>(
      '/zillow/property-details',
      { zpidOrUrl }
    );
    return response.data || null;
  } catch (error) {
    console.error('Error fetching Zillow property details:', error);
    return null;
  }
}

/**
 * Import a Zillow property to the user's portfolio
 */
export async function importZillowProperty(
  zpidOrUrl: string,
  type: 'rent' | 'airbnb' | 'flip' = 'flip',
  notes?: string
): Promise<ZillowImportResponse | null> {
  try {
    const response = await apiClient.post<ZillowImportResponse>(
      '/zillow/import',
      { zpidOrUrl, type, notes }
    );
    return response.data || null;
  } catch (error) {
    console.error('Error importing Zillow property:', error);
    return null;
  }
}

/**
 * Refresh Zillow data for an existing property
 */
export async function refreshZillowData(
  propertyId: string
): Promise<any | null> {
  try {
    const response = await apiClient.post<any>(
      `/zillow/refresh/${propertyId}`,
      {}
    );
    return response.data || null;
  } catch (error) {
    console.error('Error refreshing Zillow data:', error);
    return null;
  }
}

/**
 * Get current Zillow API usage statistics
 */
export async function getZillowUsage(): Promise<ZillowUsage | null> {
  try {
    const response = await apiClient.get<any>('/zillow/usage');
    if (response.data?.usage) {
      return {
        used: response.data.usage.quotaPercentage,
        limit: response.data.usage.quotaTotal,
        percentageUsed: response.data.usage.quotaPercentage,
        resetDate: new Date(response.data.usage.lastRequestTime).toISOString(),
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting Zillow usage:', error);
    return null;
  }
}
