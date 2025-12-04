/**
 * Mock Real Estate Data Adapter
 * Returns realistic but simulated data for development and testing
 */

import {
  IRealEstateAdapter,
  PropertyComparable,
  AirbnbMarketData,
  MortgageRate,
  MarketTrend,
} from './realEstateAdapter';

export class MockAdapter implements IRealEstateAdapter {
  private availableData: Map<string, any> = new Map();

  constructor() {
    this.initializeMockData();
  }

  /**
   * Initialize mock data for common cities
   */
  private initializeMockData() {
    // Boston market data
    this.availableData.set('Boston,MA', {
      airbnb: {
        city: 'Boston',
        state: 'MA',
        averageDailyRate: 185,
        averageOccupancy: 72,
        averageReviewScore: 4.65,
        totalListings: 3200,
        pricePerNight: 185,
        lastUpdated: new Date(),
      },
      mortgageRates: [
        { rate: 6.5, term: 15, lastUpdated: new Date() },
        { rate: 7.1, term: 30, lastUpdated: new Date() },
      ],
      trends: [
        {
          metric: 'average_price',
          value: 625000,
          trend: 'up' as const,
          percentChange: 3.2,
          period: 'year',
        },
        {
          metric: 'median_days_on_market',
          value: 28,
          trend: 'stable' as const,
          percentChange: 0,
          period: 'quarter',
        },
      ],
    });

    // New York market data
    this.availableData.set('New York,NY', {
      airbnb: {
        city: 'New York',
        state: 'NY',
        averageDailyRate: 250,
        averageOccupancy: 78,
        averageReviewScore: 4.72,
        totalListings: 8500,
        pricePerNight: 250,
        lastUpdated: new Date(),
      },
      mortgageRates: [
        { rate: 6.5, term: 15, lastUpdated: new Date() },
        { rate: 7.1, term: 30, lastUpdated: new Date() },
      ],
      trends: [
        {
          metric: 'average_price',
          value: 850000,
          trend: 'up' as const,
          percentChange: 4.1,
          period: 'year',
        },
        {
          metric: 'median_days_on_market',
          value: 35,
          trend: 'down' as const,
          percentChange: -8.5,
          period: 'quarter',
        },
      ],
    });

    // Los Angeles market data
    this.availableData.set('Los Angeles,CA', {
      airbnb: {
        city: 'Los Angeles',
        state: 'CA',
        averageDailyRate: 215,
        averageOccupancy: 75,
        averageReviewScore: 4.68,
        totalListings: 6200,
        pricePerNight: 215,
        lastUpdated: new Date(),
      },
      mortgageRates: [
        { rate: 6.5, term: 15, lastUpdated: new Date() },
        { rate: 7.1, term: 30, lastUpdated: new Date() },
      ],
      trends: [
        {
          metric: 'average_price',
          value: 775000,
          trend: 'down' as const,
          percentChange: -2.3,
          period: 'year',
        },
        {
          metric: 'median_days_on_market',
          value: 22,
          trend: 'stable' as const,
          percentChange: 0,
          period: 'quarter',
        },
      ],
    });
  }

  /**
   * Get comparable sales for a property
   */
  async getComparables(
    address: string,
    city: string,
    state: string,
    sqft: number,
    radius: number = 1
  ): Promise<PropertyComparable[]> {
    // Generate 3-5 realistic comparables
    const count = Math.floor(Math.random() * 3) + 3;
    const comps: PropertyComparable[] = [];

    const basePricePerSqft = sqft > 2000 ? 350 : sqft > 1500 ? 400 : 450;

    for (let i = 0; i < count; i++) {
      const randomSqft = sqft + (Math.random() - 0.5) * 400;
      const randomPrice = randomSqft * basePricePerSqft * (0.95 + Math.random() * 0.1);

      comps.push({
        address: `${Math.floor(Math.random() * 9000) + 1000} ${address.split(' ').slice(1).join(' ')}`,
        salePrice: Math.round(randomPrice),
        pricePerSqft: Math.round(randomPrice / randomSqft),
        saleDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Within last 90 days
        beds: Math.floor(Math.random() * 3) + 2,
        baths: Math.floor(Math.random() * 2) + 1,
        sqft: Math.round(randomSqft),
        source: 'Mock Data',
        externalId: `mock-comp-${i}`,
      });
    }

    return comps;
  }

  /**
   * Get AirBnB market data for a city
   */
  async getAirbnbMarketData(city: string, state: string): Promise<AirbnbMarketData> {
    const key = `${city},${state}`;
    const cityData = this.availableData.get(key);

    if (cityData) {
      return cityData.airbnb;
    }

    // Return generic data for unknown cities
    return {
      city,
      state,
      averageDailyRate: 150 + Math.random() * 100,
      averageOccupancy: 60 + Math.random() * 20,
      averageReviewScore: 4.5 + Math.random() * 0.5,
      totalListings: Math.floor(2000 + Math.random() * 5000),
      pricePerNight: 150 + Math.random() * 100,
      lastUpdated: new Date(),
    };
  }

  /**
   * Get current mortgage rates
   */
  async getMortgageRates(): Promise<MortgageRate[]> {
    return [
      {
        rate: 6.5,
        term: 15,
        lastUpdated: new Date(),
      },
      {
        rate: 7.1,
        term: 30,
        lastUpdated: new Date(),
      },
    ];
  }

  /**
   * Get market trends for a region
   */
  async getMarketTrends(city: string, state: string): Promise<MarketTrend[]> {
    const key = `${city},${state}`;
    const cityData = this.availableData.get(key);

    if (cityData) {
      return cityData.trends;
    }

    // Return generic trends for unknown cities
    return [
      {
        metric: 'average_price',
        value: 500000,
        trend: 'up',
        percentChange: 2.5,
        period: 'year',
      },
      {
        metric: 'median_days_on_market',
        value: 25,
        trend: 'stable',
        percentChange: 0,
        period: 'quarter',
      },
    ];
  }

  /**
   * Get property details from mock source
   */
  async getPropertyDetails(
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
  }> {
    return {
      beds: Math.floor(Math.random() * 3) + 2,
      baths: Math.floor(Math.random() * 2) + 1.5,
      sqft: Math.floor(Math.random() * 1500) + 1200,
      yearBuilt: Math.floor(Math.random() * 40) + 1980,
      zestimate: Math.floor(Math.random() * 500000) + 250000,
      rentZestimate: Math.floor(Math.random() * 3000) + 1500,
    };
  }

  /**
   * Mock adapter is always available
   */
  async isAvailable(): Promise<boolean> {
    return true;
  }
}

// Export singleton instance
export const mockAdapter = new MockAdapter();
