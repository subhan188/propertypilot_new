/**
 * AirDNA Real Estate Data Adapter (Stub)
 * Short-term rental market data from AirDNA
 * https://www.airdna.co/api/
 */

import { IRealEstateAdapter, PropertyComparable, AirbnbMarketData, MortgageRate, MarketTrend } from './realEstateAdapter';

export class AirDnaAdapter implements IRealEstateAdapter {
  private apiKey: string | null;
  private baseUrl = 'https://api.airdna.co/client/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || null;
  }

  /**
   * Set API key for AirDNA
   */
  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Get comparable sales from AirDNA
   */
  async getComparables(
    address: string,
    city: string,
    state: string,
    sqft: number,
    radius?: number
  ): Promise<PropertyComparable[]> {
    if (!this.apiKey) {
      throw new Error('AirDNA API key not configured');
    }

    // TODO: Implement actual AirDNA API call
    console.warn('AirDnaAdapter.getComparables: Not implemented. Provide AirDNA API key to enable.');
    return [];
  }

  /**
   * Get AirBnB market data from AirDNA
   */
  async getAirbnbMarketData(city: string, state: string): Promise<AirbnbMarketData> {
    if (!this.apiKey) {
      throw new Error('AirDNA API key not configured');
    }

    // TODO: Implement AirDNA market metrics call
    // const response = await fetch(`${this.baseUrl}/market/stats`, {
    //   headers: { 'Authorization': `Bearer ${this.apiKey}` },
    //   params: { city, state }
    // });

    throw new Error('AirDnaAdapter.getAirbnbMarketData: Not implemented');
  }

  /**
   * Get mortgage rates from AirDNA
   * (AirDNA doesn't provide mortgage data, but included for interface compliance)
   */
  async getMortgageRates(): Promise<MortgageRate[]> {
    throw new Error('AirDnaAdapter.getMortgageRates: Not available (AirDNA does not provide mortgage data)');
  }

  /**
   * Get market trends from AirDNA
   */
  async getMarketTrends(city: string, state: string): Promise<MarketTrend[]> {
    if (!this.apiKey) {
      throw new Error('AirDNA API key not configured');
    }

    // TODO: Implement AirDNA trends call
    throw new Error('AirDnaAdapter.getMarketTrends: Not implemented');
  }

  /**
   * Get property details from AirDNA
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
    if (!this.apiKey) {
      throw new Error('AirDNA API key not configured');
    }

    // TODO: Implement AirDNA property details call
    throw new Error('AirDnaAdapter.getPropertyDetails: Not implemented');
  }

  /**
   * Check if adapter is available
   */
  async isAvailable(): Promise<boolean> {
    return this.apiKey != null;
  }
}
