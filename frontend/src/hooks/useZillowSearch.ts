/**
 * Hook for Zillow property search via HasData API
 * Integrates with PropertyPilot backend
 */

import { useState, useCallback } from 'react';
import type { Property } from '@/types/property';

export interface ZillowListing {
  zpid: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  latitude: number;
  longitude: number;
  propertyType: string;
  zestimate?: number;
  status?: 'forSale' | 'pending' | 'sold' | 'rental' | 'off-market';
  photoLinks: string[];
  url: string;
}

export interface ZillowSearchFilters {
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  maxBeds?: number;
  minBaths?: number;
  maxBaths?: number;
  minSqft?: number;
  maxSqft?: number;
}

interface APIUsage {
  quotaRemaining: number;
  quotaPercentage: number;
}

interface UseZillowSearchReturn {
  listings: ZillowListing[];
  loading: boolean;
  error: string | null;
  apiUsage: APIUsage | null;
  search: (keyword: string, filters?: ZillowSearchFilters) => Promise<void>;
  importProperty: (
    zpidOrUrl: string,
    type?: 'rent' | 'flip' | 'airbnb',
    notes?: string
  ) => Promise<{ propertyId: string }>;
  getPropertyDetails: (zpidOrUrl: string) => Promise<any>;
}

/**
 * Hook for searching Zillow properties
 *
 * @example
 * const { listings, search, loading, error } = useZillowSearch();
 *
 * // Search for properties
 * await search('Boston, MA', { minPrice: 300000, maxPrice: 500000 });
 *
 * // Import a property to portfolio
 * const { propertyId } = await importProperty(listing.zpid, 'flip');
 */
export function useZillowSearch(): UseZillowSearchReturn {
  const [listings, setListings] = useState<ZillowListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiUsage, setApiUsage] = useState<APIUsage | null>(null);

  const search = useCallback(
    async (keyword: string, filters?: ZillowSearchFilters) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/zillow/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keyword, ...filters }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to search Zillow');
        }

        setListings(data.data.listings);
        setApiUsage(data.data.apiUsage);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getPropertyDetails = useCallback(
    async (zpidOrUrl: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/zillow/property-details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ zpidOrUrl }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch property details');
        }

        setApiUsage(data.data.apiUsage);
        return data.data.property;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const importProperty = useCallback(
    async (
      zpidOrUrl: string,
      type: 'rent' | 'flip' | 'airbnb' = 'flip',
      notes?: string
    ) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/zillow/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ zpidOrUrl, type, notes }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to import property');
        }

        setListings([]); // Clear search results after import
        return { propertyId: data.data.property.id };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    listings,
    loading,
    error,
    apiUsage,
    search,
    importProperty,
    getPropertyDetails,
  };
}
