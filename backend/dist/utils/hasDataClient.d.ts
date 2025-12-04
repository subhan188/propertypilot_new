/**
 * HasData Zillow API Client Wrapper
 * Provides methods to fetch real-time property data from Zillow via HasData API
 *
 * API Documentation:
 * - Property Details: https://docs.hasdata.com/apis/zillow/property
 * - Listings: https://docs.hasdata.com/apis/zillow/listing
 */
/**
 * HasData API Response Types
 */
export interface HasDataListingResult {
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
    photoLinks: string[];
    url: string;
    zestimate?: number;
    status?: 'forSale' | 'pending' | 'sold' | 'rental' | 'off-market';
}
export interface HasDataPropertyDetails {
    zpid: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    latitude: number;
    longitude: number;
    price: number;
    beds: number;
    baths: number;
    sqft: number;
    lotSize: number;
    yearBuilt: number;
    propertyType: string;
    zestimate: number;
    rentZestimate: number;
    priceHistory: Array<{
        date: string;
        price: number;
    }>;
    taxAssessment: number;
    taxAssessmentYear: number;
    photoLinks: string[];
    status: 'forSale' | 'pending' | 'sold' | 'rental' | 'off-market';
}
/**
 * Normalized property data for PropertyPilot database
 */
export interface NormalizedPropertyData {
    zpid: string;
    addressLine1: string;
    addressCity: string;
    addressState: string;
    addressZip: string;
    lat: number;
    lng: number;
    price: number;
    beds: number;
    baths: number;
    sqft: number;
    lotSize: number;
    propertyType: string;
    yearBuilt: number;
    zestimate: number;
    rentZestimate: number;
    taxAssessment: number;
    taxYear: number;
    status: 'forSale' | 'pending' | 'sold' | 'rental' | 'off-market';
    priceHistory: Array<{
        date: string;
        price: number;
    }>;
    rentalEstimateHistory: Array<{
        date: string;
        estimate: number;
    }>;
    photos: string[];
    url: string;
}
/**
 * Search filters for listing search
 */
export interface SearchFilters {
    minPrice?: number;
    maxPrice?: number;
    minBeds?: number;
    maxBeds?: number;
    minBaths?: number;
    maxBaths?: number;
    minSqft?: number;
    maxSqft?: number;
    propertyType?: string;
    status?: string;
}
/**
 * API usage tracking
 */
interface APIUsageStats {
    totalRequests: number;
    requestsToday: number;
    lastRequestTime: Date;
    quota: number;
    quotaRemaining: number;
}
/**
 * HasData Zillow API Client
 */
export declare class HasDataClient {
    private client;
    private apiKey;
    private baseUrl;
    private usageStats;
    constructor(apiKey?: string);
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
    searchListings(keyword: string, filters?: SearchFilters): Promise<HasDataListingResult[]>;
    /**
     * Get detailed property information from Zillow URL
     *
     * @example
     * const client = new HasDataClient(apiKey);
     * const details = await client.getPropertyDetails(
     *   'https://www.zillow.com/homedetails/123-Main-St-Boston-MA-02101/123456789_zpid'
     * );
     */
    getPropertyDetails(zpidOrUrl: string): Promise<HasDataPropertyDetails>;
    /**
     * Normalize HasData property data to PropertyPilot schema
     *
     * @example
     * const client = new HasDataClient(apiKey);
     * const details = await client.getPropertyDetails(url);
     * const normalized = client.normalizePropertyData(details);
     * // Now safe to save to database
     */
    normalizePropertyData(rawData: HasDataPropertyDetails): NormalizedPropertyData;
    /**
     * Get current API usage statistics
     */
    getUsageStats(): APIUsageStats;
    /**
     * Check if API quota is available
     */
    hasQuotaAvailable(): boolean;
    /**
     * Get quota percentage used
     */
    getQuotaPercentage(): number;
    /**
     * Track API request for quota management
     */
    private trackRequest;
    /**
     * Extract ZPID from Zillow URL or return if already ZPID
     */
    private extractZpid;
    /**
     * Build Zillow URL from ZPID and address
     */
    private buildZillowUrl;
    /**
     * Extract error message from various error types
     */
    private getErrorMessage;
}
export declare function getHasDataClient(): HasDataClient;
export {};
//# sourceMappingURL=hasDataClient.d.ts.map