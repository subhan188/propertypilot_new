/**
 * AirDNA Real Estate Data Adapter (Stub)
 * Short-term rental market data from AirDNA
 * https://www.airdna.co/api/
 */
export class AirDnaAdapter {
    constructor(apiKey) {
        this.baseUrl = 'https://api.airdna.co/client/v1';
        this.apiKey = apiKey || null;
    }
    /**
     * Set API key for AirDNA
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }
    /**
     * Get comparable sales from AirDNA
     */
    async getComparables(address, city, state, sqft, radius) {
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
    async getAirbnbMarketData(city, state) {
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
    async getMortgageRates() {
        throw new Error('AirDnaAdapter.getMortgageRates: Not available (AirDNA does not provide mortgage data)');
    }
    /**
     * Get market trends from AirDNA
     */
    async getMarketTrends(city, state) {
        if (!this.apiKey) {
            throw new Error('AirDNA API key not configured');
        }
        // TODO: Implement AirDNA trends call
        throw new Error('AirDnaAdapter.getMarketTrends: Not implemented');
    }
    /**
     * Get property details from AirDNA
     */
    async getPropertyDetails(address, city, state) {
        if (!this.apiKey) {
            throw new Error('AirDNA API key not configured');
        }
        // TODO: Implement AirDNA property details call
        throw new Error('AirDnaAdapter.getPropertyDetails: Not implemented');
    }
    /**
     * Check if adapter is available
     */
    async isAvailable() {
        return this.apiKey != null;
    }
}
//# sourceMappingURL=airdna.js.map