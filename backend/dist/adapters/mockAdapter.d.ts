/**
 * Mock Real Estate Data Adapter
 * Returns realistic but simulated data for development and testing
 */
import { IRealEstateAdapter, PropertyComparable, AirbnbMarketData, MortgageRate, MarketTrend } from './realEstateAdapter';
export declare class MockAdapter implements IRealEstateAdapter {
    private availableData;
    constructor();
    /**
     * Initialize mock data for common cities
     */
    private initializeMockData;
    /**
     * Get comparable sales for a property
     */
    getComparables(address: string, city: string, state: string, sqft: number, radius?: number): Promise<PropertyComparable[]>;
    /**
     * Get AirBnB market data for a city
     */
    getAirbnbMarketData(city: string, state: string): Promise<AirbnbMarketData>;
    /**
     * Get current mortgage rates
     */
    getMortgageRates(): Promise<MortgageRate[]>;
    /**
     * Get market trends for a region
     */
    getMarketTrends(city: string, state: string): Promise<MarketTrend[]>;
    /**
     * Get property details from mock source
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
     * Mock adapter is always available
     */
    isAvailable(): Promise<boolean>;
}
export declare const mockAdapter: MockAdapter;
//# sourceMappingURL=mockAdapter.d.ts.map