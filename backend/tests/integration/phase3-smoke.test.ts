import { createApp } from '@/app';
import { FastifyInstance } from 'fastify';

describe('Phase 3: Route Registration & Integration', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Analysis Routes', () => {
    it('mortgage-schedule analysis route is registered', async () => {
      const routes = app.printRoutes();
      expect(routes).toContain('mortgage-schedule');
      expect(routes).toContain('POST');
    });

    it('compare-scenarios analysis route is registered', async () => {
      const routes = app.printRoutes();
      expect(routes).toContain('compare-scenarios');
    });

    it('analyze scenario route is registered', async () => {
      const routes = app.printRoutes();
      expect(routes).toContain('analyze');
    });
  });

  describe('Upload Routes', () => {
    it('upload route is registered', async () => {
      const routes = app.printRoutes();
      expect(routes).toContain('upload');
    });

    it('batch upload route is registered', async () => {
      const routes = app.printRoutes();
      expect(routes).toContain('batch');
    });

    it('property files route is registered', async () => {
      const routes = app.printRoutes();
      expect(routes).toContain('files');
    });

    it('file deletion route is registered', async () => {
      const routes = app.printRoutes();
      expect(routes).toContain('DELETE');
      expect(routes).toContain('fileId');
    });

    it('refresh URL route is registered', async () => {
      const routes = app.printRoutes();
      expect(routes).toContain('refresh-url');
    });
  });

  describe('Quick Capture Routes', () => {
    it('quick-capture route is registered', async () => {
      const routes = app.printRoutes();
      expect(routes).toContain('quick-capture');
    });
  });

  describe('Phase 3 Core Services', () => {
    it('FileService should be importable', () => {
      // This is a simple smoke test to verify the module can be loaded
      expect(() => {
        require('@/services/fileService');
      }).not.toThrow();
    });

    it('S3Service should be importable', () => {
      expect(() => {
        require('@/utils/s3');
      }).not.toThrow();
    });

    it('Financial calculations should be importable', () => {
      expect(() => {
        require('@/calculations/financials');
      }).not.toThrow();
    });
  });

  describe('Phase 3 Endpoint Coverage', () => {
    it('should have analysis endpoints', () => {
      const routes = app.printRoutes();
      expect(routes).toContain('mortgage-schedule');
      expect(routes).toContain('compare-scenarios');
      expect(routes).toContain('analyze');
    });

    it('should have file upload endpoints', () => {
      const routes = app.printRoutes();
      expect(routes).toContain('upload');
      expect(routes).toContain('batch');
      expect(routes).toContain('refresh-url');
    });

    it('should have quick capture endpoints', () => {
      const routes = app.printRoutes();
      expect(routes).toContain('quick-capture');
    });
  });
});
