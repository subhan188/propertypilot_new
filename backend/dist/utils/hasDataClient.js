/**
 * HasData Zillow API Client Wrapper
 * Provides methods to fetch real-time property data from Zillow via HasData API
 *
 * API Documentation:
 * - Property Details: https://docs.hasdata.com/apis/zillow/property
 * - Listings: https://docs.hasdata.com/apis/zillow/listing
 */
import axios from 'axios';
import { config } from './config';
/**
 * HasData Zillow API Client
 */
export class HasDataClient {
    constructor(apiKey) {
        this.baseUrl = 'https://api.hasdata.com/v1';
        this.apiKey = apiKey || config.hasData?.apiKey || '';
        if (!this.apiKey) {
            throw new Error('HasData API key not configured. Set HASDATA_API_KEY environment variable.');
        }
        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'x-api-key': this.apiKey,
                'Content-Type': 'application/json',
            },
            timeout: 10000,
        });
        this.usageStats = {
            totalRequests: 0,
            requestsToday: 0,
            lastRequestTime: new Date(),
            quota: 1000, // Example: 1000 requests/month
            quotaRemaining: 1000,
        };
    }
    /**
     * Search Zillow listings by keyword
     *
     * @example
     * const client = new HasDataClient(apiKey);
     * const results = await client.searchListings('Boston, MA', {
     *   minPrice: 300000,
     *   maxPrice: 500000,
     *   minBeds: 3
     * });
     */
    async searchListings(keyword, filters) {
        try {
            this.trackRequest();
            const params = {
                keyword,
                pageSize: 50,
            };
            // Add filters to params
            if (filters) {
                if (filters.minPrice !== undefined)
                    params.min_price = filters.minPrice;
                if (filters.maxPrice !== undefined)
                    params.max_price = filters.maxPrice;
                if (filters.minBeds !== undefined)
                    params.min_beds = filters.minBeds;
                if (filters.maxBeds !== undefined)
                    params.max_beds = filters.maxBeds;
                if (filters.minBaths !== undefined)
                    params.min_baths = filters.minBaths;
                if (filters.maxBaths !== undefined)
                    params.max_baths = filters.maxBaths;
                if (filters.minSqft !== undefined)
                    params.min_sqft = filters.minSqft;
                if (filters.maxSqft !== undefined)
                    params.max_sqft = filters.maxSqft;
                if (filters.propertyType !== undefined)
                    params.property_type = filters.propertyType;
                if (filters.status !== undefined)
                    params.status = filters.status;
            }
            const response = await this.client.get('/zillow/listing', {
                params,
            });
            return response.data.results || [];
        }
        catch (error) {
            console.error('HasData searchListings error:', error);
            throw new Error(`Failed to search listings: ${this.getErrorMessage(error)}`);
        }
    }
    /**
     * Get detailed property information from Zillow URL
     *
     * @example
     * const client = new HasDataClient(apiKey);
     * const details = await client.getPropertyDetails(
     *   'https://www.zillow.com/homedetails/123-Main-St-Boston-MA-02101/123456789_zpid'
     * );
     */
    async getPropertyDetails(zpidOrUrl) {
        try {
            this.trackRequest();
            // If URL provided, extract ZPID
            const zpid = this.extractZpid(zpidOrUrl);
            const response = await this.client.get('/zillow/property', {
                params: { zpid },
            });
            return response.data;
        }
        catch (error) {
            console.error('HasData getPropertyDetails error:', error);
            throw new Error(`Failed to fetch property details: ${this.getErrorMessage(error)}`);
        }
    }
    /**
     * Normalize HasData property data to PropertyPilot schema
     *
     * @example
     * const client = new HasDataClient(apiKey);
     * const details = await client.getPropertyDetails(url);
     * const normalized = client.normalizePropertyData(details);
     * // Now safe to save to database
     */
    normalizePropertyData(rawData) {
        return {
            zpid: rawData.zpid,
            addressLine1: rawData.address,
            addressCity: rawData.city,
            addressState: rawData.state,
            addressZip: rawData.zipCode,
            lat: rawData.latitude,
            lng: rawData.longitude,
            price: rawData.price,
            beds: rawData.beds,
            baths: rawData.baths,
            sqft: rawData.sqft,
            lotSize: rawData.lotSize || 0,
            propertyType: rawData.propertyType,
            yearBuilt: rawData.yearBuilt || new Date().getFullYear(),
            zestimate: rawData.zestimate || rawData.price,
            rentZestimate: rawData.rentZestimate || 0,
            taxAssessment: rawData.taxAssessment || 0,
            taxYear: rawData.taxAssessmentYear || new Date().getFullYear(),
            status: rawData.status || 'off-market',
            priceHistory: rawData.priceHistory || [
                {
                    date: new Date().toISOString().split('T')[0],
                    price: rawData.price,
                },
            ],
            rentalEstimateHistory: [
                {
                    date: new Date().toISOString().split('T')[0],
                    estimate: rawData.rentZestimate,
                },
            ],
            photos: rawData.photoLinks || [],
            url: this.buildZillowUrl(rawData.zpid, rawData.address),
        };
    }
    /**
     * Get current API usage statistics
     */
    getUsageStats() {
        return { ...this.usageStats };
    }
    /**
     * Check if API quota is available
     */
    hasQuotaAvailable() {
        return this.usageStats.quotaRemaining > 0;
    }
    /**
     * Get quota percentage used
     */
    getQuotaPercentage() {
        return (((this.usageStats.quota - this.usageStats.quotaRemaining) /
            this.usageStats.quota) *
            100);
    }
    // ============ Private Helper Methods ============
    /**
     * Track API request for quota management
     */
    trackRequest() {
        this.usageStats.totalRequests++;
        this.usageStats.requestsToday++;
        this.usageStats.lastRequestTime = new Date();
        this.usageStats.quotaRemaining--;
        // Log warning if quota is low
        if (this.usageStats.quotaRemaining < 100) {
            console.warn(`HasData API quota running low: ${this.usageStats.quotaRemaining} requests remaining`);
        }
    }
    /**
     * Extract ZPID from Zillow URL or return if already ZPID
     */
    extractZpid(zpidOrUrl) {
        // If it's already a ZPID (numeric), return it
        if (/^\d+$/.test(zpidOrUrl)) {
            return zpidOrUrl;
        }
        // Try to extract from Zillow URL
        const match = zpidOrUrl.match(/\/(\d+)_zpid/);
        if (match) {
            return match[1];
        }
        // Try alternate URL format
        const match2 = zpidOrUrl.match(/\?zpid=(\d+)/);
        if (match2) {
            return match2[1];
        }
        // Return as-is if no match
        return zpidOrUrl;
    }
    /**
     * Build Zillow URL from ZPID and address
     */
    buildZillowUrl(zpid, address) {
        // Format address for URL
        const urlAddress = address.toLowerCase().replace(/\s+/g, '-');
        return `https://www.zillow.com/homedetails/${urlAddress}/${zpid}_zpid`;
    }
    /**
     * Extract error message from various error types
     */
    getErrorMessage(error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                return 'Invalid API key';
            }
            if (error.response?.status === 429) {
                return 'API quota exceeded';
            }
            if (error.response?.status === 404) {
                return 'Property not found';
            }
            return error.response?.data?.message || error.message;
        }
        return error instanceof Error ? error.message : 'Unknown error';
    }
}
/**
 * Singleton instance for application-wide use
 */
let hasDataClientInstance = null;
export function getHasDataClient() {
    if (!hasDataClientInstance) {
        hasDataClientInstance = new HasDataClient();
    }
    return hasDataClientInstance;
}
//# sourceMappingURL=hasDataClient.js.map