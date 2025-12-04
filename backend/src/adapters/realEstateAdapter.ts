/**
 * Real Estate Data Adapter Interface
 * Pluggable architecture for different data sources (Zillow, AirDNA, MLS, etc.)
 */

export interface PropertyComparable {
  address: string;
  salePrice: number;
  pricePerSqft: number;
  saleDate: Date;
  beds: number;
  baths: number;
  sqft: number;
  source: string;
  externalId: string;
}

export interface AirbnbMarketData {
  city: string;
  state: string;
  averageDailyRate: number;
  averageOccupancy: number;
  averageReviewScore: number;
  totalListings: number;
  pricePerNight: number;
  lastUpdated: Date;
}

export interface MortgageRate {
  rate: number;
  term: number; // years (15, 30, etc.)
  lastUpdated: Date;
}

export interface MarketTrend {
  metric: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  percentChange: number;
  period: string; // 'month', 'quarter', 'year'
}

/**
 * Base adapter interface for real estate data sources
 */
export interface IRealEstateAdapter {
  /**
   * Get comparable sales for a property
   * @param address - Property address
   * @param city - City
   * @param state - State
   * @param sqft - Square footage for comparison
   * @param radius - Search radius in miles (optional)
   * @returns Array of comparable properties
   */
  getComparables(
    address: string,
    city: string,
    state: string,
    sqft: number,
    radius?: number
  ): Promise<PropertyComparable[]>;

  /**
   * Get AirBnB market data for a city
   * @param city - City name
   * @param state - State
   * @returns AirBnB market metrics
   */
  getAirbnbMarketData(city: string, state: string): Promise<AirbnbMarketData>;

  /**
   * Get current mortgage rates
   * @returns Array of mortgage rates for different terms
   */
  getMortgageRates(): Promise<MortgageRate[]>;

  /**
   * Get market trends for a region
   * @param city - City name
   * @param state - State
   * @returns Array of market trends
   */
  getMarketTrends(city: string, state: string): Promise<MarketTrend[]>;

  /**
   * Get property details from external source
   * @param address - Property address
   * @param city - City
   * @param state - State
   * @returns Property details
   */
  getPropertyDetails(
    address: string,
    city: string,
    state: string
  ): Promise<{
    beds?: number;
    baths?: number;
    sqft?: number;
    yearBuilt?: number;
    zestimate?: number;
    rentZestimate?: number;
  }>;

  /**
   * Check if adapter is available/authenticated
   */
  isAvailable(): Promise<boolean>;
}

/**
 * Adapter factory class to manage adapter instances
 */
export class RealEstateAdapterFactory {
  private static adapters: Map<string, IRealEstateAdapter> = new Map();

  /**
   * Register an adapter
   */
  static registerAdapter(name: string, adapter: IRealEstateAdapter) {
    this.adapters.set(name, adapter);
  }

  /**
   * Get adapter by name
   */
  static getAdapter(name: string): IRealEstateAdapter | null {
    return this.adapters.get(name) || null;
  }

  /**
   * Get all registered adapters
   */
  static getAllAdapters(): Map<string, IRealEstateAdapter> {
    return this.adapters;
  }

  /**
   * Get available adapters (that are authenticated/working)
   */
  static async getAvailableAdapters(): Promise<IRealEstateAdapter[]> {
    const available: IRealEstateAdapter[] = [];

    for (const adapter of this.adapters.values()) {
      try {
        if (await adapter.isAvailable()) {
          available.push(adapter);
        }
      } catch (error) {
        // Skip unavailable adapters
      }
    }

    return available;
  }
}
