/**
 * Zillow Real Estate Data Adapter (Stub)
 * Placeholder for Zillow API integration
 * https://www.zillow.com/api/
 */
import { IRealEstateAdapter, PropertyComparable, AirbnbMarketData, MortgageRate, MarketTrend } from './realEstateAdapter';
export declare class ZillowAdapter implements IRealEstateAdapter {
    private apiKey;
    private baseUrl;
    constructor(apiKey?: string);
    /**
     * Set API key for Zillow
     */
    setApiKey(apiKey: string): void;
    /**
     * Get comparable sales from Zillow
     */
    getComparables(address: string, city: string, state: string, sqft: number, radius?: number): Promise<PropertyComparable[]>;
    /**
     * Get AirBnB data from Zillow
     */
    getAirbnbMarketData(city: string, state: string): Promise<AirbnbMarketData>;
    /**
     * Get mortgage rates from Zillow
     */
    getMortgageRates(): Promise<MortgageRate[]>;
    /**
     * Get market trends from Zillow
     */
    getMarketTrends(city: string, state: string): Promise<MarketTrend[]>;
    /**
     * Get property details from Zillow
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
}
//# sourceMappingURL=zillow.d.ts.map