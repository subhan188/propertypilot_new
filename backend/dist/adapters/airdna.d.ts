/**
 * AirDNA Real Estate Data Adapter (Stub)
 * Short-term rental market data from AirDNA
 * https://www.airdna.co/api/
 */
import { IRealEstateAdapter, PropertyComparable, AirbnbMarketData, MortgageRate, MarketTrend } from './realEstateAdapter';
export declare class AirDnaAdapter implements IRealEstateAdapter {
    private apiKey;
    private baseUrl;
    constructor(apiKey?: string);
    /**
     * Set API key for AirDNA
     */
    setApiKey(apiKey: string): void;
    /**
     * Get comparable sales from AirDNA
     */
    getComparables(address: string, city: string, state: string, sqft: number, radius?: number): Promise<PropertyComparable[]>;
    /**
     * Get AirBnB market data from AirDNA
     */
    getAirbnbMarketData(city: string, state: string): Promise<AirbnbMarketData>;
    /**
     * Get mortgage rates from AirDNA
     * (AirDNA doesn't provide mortgage data, but included for interface compliance)
     */
    getMortgageRates(): Promise<MortgageRate[]>;
    /**
     * Get market trends from AirDNA
     */
    getMarketTrends(city: string, state: string): Promise<MarketTrend[]>;
    /**
     * Get property details from AirDNA
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
//# sourceMappingURL=airdna.d.ts.map