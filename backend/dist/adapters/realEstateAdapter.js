/**
 * Real Estate Data Adapter Interface
 * Pluggable architecture for different data sources (Zillow, AirDNA, MLS, etc.)
 */
/**
 * Adapter factory class to manage adapter instances
 */
export class RealEstateAdapterFactory {
    /**
     * Register an adapter
     */
    static registerAdapter(name, adapter) {
        this.adapters.set(name, adapter);
    }
    /**
     * Get adapter by name
     */
    static getAdapter(name) {
        return this.adapters.get(name) || null;
    }
    /**
     * Get all registered adapters
     */
    static getAllAdapters() {
        return this.adapters;
    }
    /**
     * Get available adapters (that are authenticated/working)
     */
    static async getAvailableAdapters() {
        const available = [];
        for (const adapter of this.adapters.values()) {
            try {
                if (await adapter.isAvailable()) {
                    available.push(adapter);
                }
            }
            catch (error) {
                // Skip unavailable adapters
            }
        }
        return available;
    }
}
RealEstateAdapterFactory.adapters = new Map();
//# sourceMappingURL=realEstateAdapter.js.map