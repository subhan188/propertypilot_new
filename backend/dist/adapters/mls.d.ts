/**
 * MLS (Multiple Listing Service) Real Estate Data Adapter (Stub)
 * Provides MLS listing data for comparable sales
 * MLS APIs vary by region - typically provided by local MLS associations
 */
import { IRealEstateAdapter, PropertyComparable, AirbnbMarketData, MortgageRate, MarketTrend } from './realEstateAdapter';
export declare class MLSAdapter implements IRealEstateAdapter {
    private apiKey;
    private region;
    constructor(region: string, apiKey?: string);
    /**
     * Set API key for MLS
     */
    setApiKey(apiKey: string): void;
    /**
     * Get comparable sales from MLS
     */
    getComparables(address: string, city: string, state: string, sqft: number, radius?: number): Promise<PropertyComparable[]>;
    /**
     * Get AirBnB data from MLS
     * (MLS doesn't typically provide Airbnb data)
     */
    getAirbnbMarketData(city: string, state: string): Promise<AirbnbMarketData>;
    /**
     * Get mortgage rates from MLS
     * (MLS doesn't provide mortgage rates)
     */
    getMortgageRates(): Promise<MortgageRate[]>;
    /**
     * Get market trends from MLS
     */
    getMarketTrends(city: string, state: string): Promise<MarketTrend[]>;
    /**
     * Get property details from MLS
     */
    getPropertyDetails(address: string, city: string, state: string): Promise<{
        beds?: number;
        baths?: number;
        sqft?: number;
        yearBuilt?: number;
        zestimate?: number;
        rentZestimate?: number;
    }>;
    /**
     * Check if adapter is available
     */
    isAvailable(): Promise<boolean>;
    /**
     * Get the MLS region this adapter serves
     */
    getRegion(): string;
}
//# sourceMappingURL=mls.d.ts.map