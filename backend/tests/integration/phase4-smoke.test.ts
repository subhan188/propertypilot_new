/**
 * Phase 4: Workers & Integrations Smoke Tests
 * Validates that all worker infrastructure and adapter components are properly set up
 */

import { createApp } from '@/app';
import { FastifyInstance } from 'fastify';

describe('Phase 4: Workers & Integrations', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Integration Routes', () => {
    it('GET /api/integrations route is registered', () => {
      const routes = app.printRoutes();
      expect(routes).toContain('integrations');
      expect(routes).toContain('GET');
    });

    it(':service/connect route is registered', () => {
      const routes = app.printRoutes();
      expect(routes).toContain('connect');
    });

    it(':service/disconnect route is registered', () => {
      const routes = app.printRoutes();
      expect(routes).toContain('disconnect');
      expect(routes).toContain('DELETE');
    });

    it(':service/test route is registered', () => {
      const routes = app.printRoutes();
      expect(routes).toContain('test');
    });
  });

  describe('Worker Queue', () => {
    it('propertyPilotQueue should be importable', () => {
      expect(() => {
        require('@/workers/queue');
      }).not.toThrow();
    });

    it('Job types should be defined', () => {
      const types = require('@/workers/types');
      expect(types.JobType).toBeDefined();
      expect(types.JobType.REFRESH_PROPERTY_COMPS).toBeDefined();
      expect(types.JobType.SYNC_AIRDNA_DATA).toBeDefined();
      expect(types.JobType.GENERATE_DAILY_ALERTS).toBeDefined();
    });
  });

  describe('Real Estate Adapters', () => {
    it('Real estate adapter interface should be importable', () => {
      expect(() => {
        require('@/adapters/realEstateAdapter');
      }).not.toThrow();
    });

    it('MockAdapter should be importable', () => {
      expect(() => {
        require('@/adapters/mockAdapter');
      }).not.toThrow();
    });

    it('ZillowAdapter should be importable', () => {
      expect(() => {
        require('@/adapters/zillow');
      }).not.toThrow();
    });

    it('AirDnaAdapter should be importable', () => {
      expect(() => {
        require('@/adapters/airdna');
      }).not.toThrow();
    });

    it('MLSAdapter should be importable', () => {
      expect(() => {
        require('@/adapters/mls');
      }).not.toThrow();
    });
  });

  describe('Job Handlers', () => {
    it('refreshPropertyCompsHandler should be importable', () => {
      expect(() => {
        require('@/workers/jobs/refreshPropertyComps');
      }).not.toThrow();
    });

    it('syncAirbnbDataHandler should be importable', () => {
      expect(() => {
        require('@/workers/jobs/syncAirbnbData');
      }).not.toThrow();
    });

    it('generateDailyAlertsHandler should be importable', () => {
      expect(() => {
        require('@/workers/jobs/generateDailyAlerts');
      }).not.toThrow();
    });
  });

  describe('MockAdapter Functionality', () => {
    it('MockAdapter.getComparables should return property comparables', async () => {
      const { mockAdapter } = require('@/adapters/mockAdapter');

      const comps = await mockAdapter.getComparables(
        '123 Main St',
        'Boston',
        'MA',
        2000,
        1
      );

      expect(Array.isArray(comps)).toBe(true);
      expect(comps.length).toBeGreaterThan(0);
      expect(comps[0]).toHaveProperty('address');
      expect(comps[0]).toHaveProperty('salePrice');
      expect(comps[0]).toHaveProperty('pricePerSqft');
    });

    it('MockAdapter.getAirbnbMarketData should return market data', async () => {
      const { mockAdapter } = require('@/adapters/mockAdapter');

      const data = await mockAdapter.getAirbnbMarketData('Boston', 'MA');

      expect(data).toHaveProperty('city', 'Boston');
      expect(data).toHaveProperty('state', 'MA');
      expect(data).toHaveProperty('averageDailyRate');
      expect(data).toHaveProperty('averageOccupancy');
      expect(data.averageOccupancy).toBeGreaterThan(0);
      expect(data.averageOccupancy).toBeLessThanOrEqual(100);
    });

    it('MockAdapter.getMortgageRates should return rates', async () => {
      const { mockAdapter } = require('@/adapters/mockAdapter');

      const rates = await mockAdapter.getMortgageRates();

      expect(Array.isArray(rates)).toBe(true);
      expect(rates.length).toBeGreaterThan(0);
      expect(rates[0]).toHaveProperty('rate');
      expect(rates[0]).toHaveProperty('term');
    });

    it('MockAdapter.getMarketTrends should return trends', async () => {
      const { mockAdapter } = require('@/adapters/mockAdapter');

      const trends = await mockAdapter.getMarketTrends('Boston', 'MA');

      expect(Array.isArray(trends)).toBe(true);
      expect(trends.length).toBeGreaterThan(0);
      expect(trends[0]).toHaveProperty('metric');
      expect(trends[0]).toHaveProperty('value');
      expect(trends[0]).toHaveProperty('trend');
    });

    it('MockAdapter.isAvailable should return true', async () => {
      const { mockAdapter } = require('@/adapters/mockAdapter');

      const available = await mockAdapter.isAvailable();

      expect(available).toBe(true);
    });
  });

  describe('Adapter Factory', () => {
    it('RealEstateAdapterFactory should be importable', () => {
      expect(() => {
        require('@/adapters/realEstateAdapter');
      }).not.toThrow();
    });

    it('RealEstateAdapterFactory.registerAdapter should work', () => {
      const { RealEstateAdapterFactory } = require('@/adapters/realEstateAdapter');
      const { mockAdapter } = require('@/adapters/mockAdapter');

      expect(() => {
        RealEstateAdapterFactory.registerAdapter('test', mockAdapter);
      }).not.toThrow();
    });

    it('RealEstateAdapterFactory.getAdapter should retrieve registered adapter', () => {
      const { RealEstateAdapterFactory } = require('@/adapters/realEstateAdapter');
      const { mockAdapter } = require('@/adapters/mockAdapter');

      RealEstateAdapterFactory.registerAdapter('mock', mockAdapter);
      const adapter = RealEstateAdapterFactory.getAdapter('mock');

      expect(adapter).toBeDefined();
      expect(adapter).toBe(mockAdapter);
    });
  });

  describe('Phase 4 Endpoint Coverage', () => {
    it('should have integrations endpoints', () => {
      const routes = app.printRoutes();
      expect(routes).toContain('integrations');
      expect(routes).toContain('connect');
      expect(routes).toContain('disconnect');
      expect(routes).toContain('test');
    });
  });

  describe('Phase 4 Worker Infrastructure', () => {
    it('should have BullMQ queue setup', async () => {
      const { propertyPilotQueue } = require('@/workers/queue');
      expect(propertyPilotQueue).toBeDefined();
      expect(propertyPilotQueue.name).toBe('property-pilot');
    });

    it('should have all job types defined', () => {
      const { JobType } = require('@/workers/types');
      expect(JobType.REFRESH_PROPERTY_COMPS).toBe('refresh-property-comps');
      expect(JobType.SYNC_AIRDNA_DATA).toBe('sync-airdna-data');
      expect(JobType.GENERATE_DAILY_ALERTS).toBe('generate-daily-alerts');
    });

    it('job handlers should export async functions', async () => {
      const compsHandler = require('@/workers/jobs/refreshPropertyComps');
      const airbnbHandler = require('@/workers/jobs/syncAirbnbData');
      const alertsHandler = require('@/workers/jobs/generateDailyAlerts');

      expect(typeof compsHandler.refreshPropertyCompsHandler).toBe('function');
      expect(typeof airbnbHandler.syncAirbnbDataHandler).toBe('function');
      expect(typeof alertsHandler.generateDailyAlertsHandler).toBe('function');
    });
  });
});
