import { createApp } from '@/app';
import { prisma } from '@/db/prisma';
import { FastifyInstance } from 'fastify';

describe('Property Management - Full Lifecycle', () => {
  let app: FastifyInstance;
  let sessionCookie: string | undefined;
  let userId: string;
  let propertyId: string;

  beforeAll(async () => {
    app = await createApp();
    await app.ready();

    // Register and login
    const registerResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email: 'property@test.com',
        password: 'password123',
        name: 'Property User',
      },
    });

    const registerBody = JSON.parse(registerResponse.body);
    userId = registerBody.data.user.id;

    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'property@test.com',
        password: 'password123',
      },
    });

    const cookies = loginResponse.headers['set-cookie'];
    sessionCookie = Array.isArray(cookies) ? cookies[0] : cookies;
  });

  afterAll(async () => {
    await app.close();
    await prisma.property.deleteMany({
      where: { userId },
    });
    await prisma.user.deleteMany({
      where: { id: userId },
    });
  });

  describe('Property CRUD', () => {
    describe('POST /api/properties', () => {
      it('should create a new property', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/properties',
          cookies: { sessionid: sessionCookie || '' },
          payload: {
            address: '123 Main Street',
            city: 'Austin',
            state: 'TX',
            zipCode: '78701',
            type: 'rent',
            status: 'analyzing',
            purchasePrice: 350000,
            currentValue: 380000,
            arv: 400000,
            sqft: 1800,
            bedrooms: 3,
            bathrooms: 2,
            yearBuilt: 2010,
            lotSize: 0.15,
            latitude: 30.2672,
            longitude: -97.7431,
          },
        });

        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data.property.address).toBe('123 Main Street');
        expect(body.data.property.city).toBe('Austin');
        propertyId = body.data.property.id;
      });

      it('should reject missing required fields', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/properties',
          cookies: { sessionid: sessionCookie || '' },
          payload: {
            address: '456 Oak Avenue',
            // Missing city, state, zipCode
            type: 'rent',
            status: 'lead',
          },
        });

        expect(response.statusCode).toBe(400);
      });

      it('should reject invalid property type', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/properties',
          cookies: { sessionid: sessionCookie || '' },
          payload: {
            address: '456 Oak Avenue',
            city: 'Denver',
            state: 'CO',
            zipCode: '80202',
            type: 'invalid-type',
            status: 'lead',
            purchasePrice: 300000,
            currentValue: 300000,
            arv: 350000,
            sqft: 1600,
            bedrooms: 3,
            bathrooms: 2,
            yearBuilt: 2015,
            lotSize: 0.12,
            latitude: 39.7392,
            longitude: -104.9903,
          },
        });

        expect(response.statusCode).toBe(400);
      });
    });

    describe('GET /api/properties', () => {
      it('should list all user properties with pagination', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/properties',
          cookies: { sessionid: sessionCookie || '' },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(Array.isArray(body.data)).toBe(true);
        expect(body.total).toBeGreaterThan(0);
        expect(body.page).toBe(1);
        expect(body.pageSize).toBe(20);
      });

      it('should filter properties by type', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/properties?type=rent',
          cookies: { sessionid: sessionCookie || '' },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        body.data.forEach((property: any) => {
          expect(property.type).toBe('rent');
        });
      });

      it('should filter properties by status', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/properties?status=analyzing',
          cookies: { sessionid: sessionCookie || '' },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        body.data.forEach((property: any) => {
          expect(property.status).toBe('analyzing');
        });
      });

      it('should filter properties by city (case insensitive)', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/properties?city=austin',
          cookies: { sessionid: sessionCookie || '' },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        if (body.data.length > 0) {
          expect(body.data[0].city.toLowerCase()).toContain('austin');
        }
      });

      it('should support pagination', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/properties?page=1&pageSize=5',
          cookies: { sessionid: sessionCookie || '' },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.pageSize).toBe(5);
      });
    });

    describe('GET /api/properties/:id', () => {
      it('should get property detail with relationships', async () => {
        const response = await app.inject({
          method: 'GET',
          url: `/api/properties/${propertyId}`,
          cookies: { sessionid: sessionCookie || '' },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data.property.id).toBe(propertyId);
        expect(body.data.property.scenarios).toBeDefined();
        expect(body.data.property.renovations).toBeDefined();
      });

      it('should return 404 for non-existent property', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/properties/nonexistent',
          cookies: { sessionid: sessionCookie || '' },
        });

        expect(response.statusCode).toBe(404);
      });

      it('should not allow access to other user properties', async () => {
        // Register another user
        const otherUserResponse = await app.inject({
          method: 'POST',
          url: '/api/auth/register',
          payload: {
            email: 'other@test.com',
            password: 'password123',
            name: 'Other User',
          },
        });

        const otherUserId = JSON.parse(otherUserResponse.body).data.user.id;

        // Try to access first user's property with other user's session
        const otherUserLoginResponse = await app.inject({
          method: 'POST',
          url: '/api/auth/login',
          payload: {
            email: 'other@test.com',
            password: 'password123',
          },
        });

        const otherCookies = otherUserLoginResponse.headers['set-cookie'];
        const otherSessionCookie = Array.isArray(otherCookies) ? otherCookies[0] : otherCookies;

        const response = await app.inject({
          method: 'GET',
          url: `/api/properties/${propertyId}`,
          cookies: { sessionid: otherSessionCookie || '' },
        });

        expect(response.statusCode).toBe(404);

        // Cleanup
        await prisma.user.deleteMany({
          where: { id: otherUserId },
        });
      });
    });

    describe('PUT /api/properties/:id', () => {
      it('should update property fields', async () => {
        const response = await app.inject({
          method: 'PUT',
          url: `/api/properties/${propertyId}`,
          cookies: { sessionid: sessionCookie || '' },
          payload: {
            currentValue: 400000,
            status: 'offer',
          },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data.property.currentValue).toBe(400000);
        expect(body.data.property.status).toBe('offer');
      });

      it('should return 404 for non-existent property', async () => {
        const response = await app.inject({
          method: 'PUT',
          url: '/api/properties/nonexistent',
          cookies: { sessionid: sessionCookie || '' },
          payload: {
            currentValue: 400000,
          },
        });

        expect(response.statusCode).toBe(404);
      });
    });

    describe('DELETE /api/properties/:id', () => {
      it('should soft delete property by marking as sold', async () => {
        const response = await app.inject({
          method: 'DELETE',
          url: `/api/properties/${propertyId}`,
          cookies: { sessionid: sessionCookie || '' },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);

        // Verify property is marked as sold
        const property = await prisma.property.findUnique({
          where: { id: propertyId },
        });
        expect(property?.status).toBe('sold');
      });
    });

    describe('GET /api/properties/map/data', () => {
      it('should return properties with map data', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/properties/map/data',
          cookies: { sessionid: sessionCookie || '' },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(Array.isArray(body.data.properties)).toBe(true);
        if (body.data.properties.length > 0) {
          const prop = body.data.properties[0];
          expect(prop.id).toBeDefined();
          expect(prop.latitude).toBeDefined();
          expect(prop.longitude).toBeDefined();
        }
      });
    });
  });

  describe('Scenario Management', () => {
    let scenarioId: string;
    let rentalPropertyId: string;

    beforeAll(async () => {
      // Create a rental property for scenario testing
      const response = await app.inject({
        method: 'POST',
        url: '/api/properties',
        cookies: { sessionid: sessionCookie || '' },
        payload: {
          address: '456 Pine Street',
          city: 'Denver',
          state: 'CO',
          zipCode: '80202',
          type: 'rent',
          status: 'analyzing',
          purchasePrice: 400000,
          currentValue: 420000,
          arv: 450000,
          sqft: 2000,
          bedrooms: 4,
          bathrooms: 2,
          yearBuilt: 2015,
          lotSize: 0.12,
          latitude: 39.7392,
          longitude: -104.9903,
        },
      });

      rentalPropertyId = JSON.parse(response.body).data.property.id;
    });

    describe('POST /api/properties/:propertyId/scenarios', () => {
      it('should create a deal scenario', async () => {
        const response = await app.inject({
          method: 'POST',
          url: `/api/properties/${rentalPropertyId}/scenarios`,
          cookies: { sessionid: sessionCookie || '' },
          payload: {
            name: 'Conservative Rental',
            purchasePrice: 400000,
            rehabCost: 15000,
            holdingCosts: 2000,
            closingCosts: 12000,
            interestRate: 7,
            holdTimeMonths: 240,
            exitStrategy: 'rent',
            monthlyRent: 2500,
            occupancyRate: 95,
          },
        });

        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data.scenario.name).toBe('Conservative Rental');
        scenarioId = body.data.scenario.id;
      });
    });

    describe('GET /api/properties/:propertyId/scenarios', () => {
      it('should list property scenarios', async () => {
        const response = await app.inject({
          method: 'GET',
          url: `/api/properties/${rentalPropertyId}/scenarios`,
          cookies: { sessionid: sessionCookie || '' },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(Array.isArray(body.data.scenarios)).toBe(true);
      });
    });

    describe('PUT /api/scenarios/:id', () => {
      it('should update scenario', async () => {
        const response = await app.inject({
          method: 'PUT',
          url: `/api/scenarios/${scenarioId}`,
          cookies: { sessionid: sessionCookie || '' },
          payload: {
            monthlyRent: 2600,
            occupancyRate: 96,
          },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data.scenario.monthlyRent).toBe(2600);
      });
    });

    describe('DELETE /api/scenarios/:id', () => {
      it('should delete scenario', async () => {
        const response = await app.inject({
          method: 'DELETE',
          url: `/api/scenarios/${scenarioId}`,
          cookies: { sessionid: sessionCookie || '' },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
      });
    });
  });

  describe('Renovation Management', () => {
    let renovationPropertyId: string;
    let renovationId: string;

    beforeAll(async () => {
      // Create a property for renovation testing
      const response = await app.inject({
        method: 'POST',
        url: '/api/properties',
        cookies: { sessionid: sessionCookie || '' },
        payload: {
          address: '789 Elm Street',
          city: 'Phoenix',
          state: 'AZ',
          zipCode: '85001',
          type: 'flip',
          status: 'under_contract',
          purchasePrice: 275000,
          currentValue: 275000,
          arv: 385000,
          sqft: 1650,
          bedrooms: 3,
          bathrooms: 2,
          yearBuilt: 1985,
          lotSize: 0.18,
          latitude: 33.4484,
          longitude: -112.0740,
        },
      });

      renovationPropertyId = JSON.parse(response.body).data.property.id;
    });

    describe('POST /api/properties/:propertyId/renovations', () => {
      it('should create a renovation item', async () => {
        const response = await app.inject({
          method: 'POST',
          url: `/api/properties/${renovationPropertyId}/renovations`,
          cookies: { sessionid: sessionCookie || '' },
          payload: {
            category: 'Kitchen',
            description: 'Full kitchen remodel',
            estimatedCost: 25000,
            status: 'pending',
          },
        });

        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data.renovation.category).toBe('Kitchen');
        renovationId = body.data.renovation.id;
      });
    });

    describe('GET /api/properties/:propertyId/renovations', () => {
      it('should list property renovations', async () => {
        const response = await app.inject({
          method: 'GET',
          url: `/api/properties/${renovationPropertyId}/renovations`,
          cookies: { sessionid: sessionCookie || '' },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(Array.isArray(body.data.renovations)).toBe(true);
      });

      it('should filter renovations by status', async () => {
        const response = await app.inject({
          method: 'GET',
          url: `/api/properties/${renovationPropertyId}/renovations?status=pending`,
          cookies: { sessionid: sessionCookie || '' },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        body.data.renovations.forEach((renovation: any) => {
          expect(renovation.status).toBe('pending');
        });
      });
    });

    describe('PUT /api/renovations/:id', () => {
      it('should update renovation', async () => {
        const response = await app.inject({
          method: 'PUT',
          url: `/api/renovations/${renovationId}`,
          cookies: { sessionid: sessionCookie || '' },
          payload: {
            status: 'in_progress',
            actualCost: 24000,
          },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data.renovation.status).toBe('in_progress');
      });
    });

    describe('DELETE /api/renovations/:id', () => {
      it('should delete renovation', async () => {
        const response = await app.inject({
          method: 'DELETE',
          url: `/api/renovations/${renovationId}`,
          cookies: { sessionid: sessionCookie || '' },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
      });
    });
  });

  describe('Alert Management', () => {
    let alertId: string;

    describe('GET /api/alerts', () => {
      it('should list user alerts', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/alerts',
          cookies: { sessionid: sessionCookie || '' },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(Array.isArray(body.data.alerts)).toBe(true);
        expect(body.data.unreadCount).toBeDefined();
      });

      it('should filter unread alerts', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/alerts?read=false',
          cookies: { sessionid: sessionCookie || '' },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        body.data.alerts.forEach((alert: any) => {
          expect(alert.read).toBe(false);
        });
      });
    });

    describe('PUT /api/alerts/:id/read', () => {
      beforeAll(async () => {
        // Create an alert first
        const alert = await prisma.alert.create({
          data: {
            userId,
            type: 'info',
            title: 'Test Alert',
            message: 'This is a test alert',
            read: false,
          },
        });
        alertId = alert.id;
      });

      it('should mark alert as read', async () => {
        const response = await app.inject({
          method: 'PUT',
          url: `/api/alerts/${alertId}/read`,
          cookies: { sessionid: sessionCookie || '' },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data.alert.read).toBe(true);
      });
    });

    describe('POST /api/alerts/mark-all-read', () => {
      it('should mark all alerts as read', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/alerts/mark-all-read',
          cookies: { sessionid: sessionCookie || '' },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
      });
    });

    describe('DELETE /api/alerts/:id', () => {
      it('should delete alert', async () => {
        // Create a new alert to delete
        const alert = await prisma.alert.create({
          data: {
            userId,
            type: 'warning',
            title: 'Alert to Delete',
            message: 'This alert will be deleted',
          },
        });

        const response = await app.inject({
          method: 'DELETE',
          url: `/api/alerts/${alert.id}`,
          cookies: { sessionid: sessionCookie || '' },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
      });
    });

    describe('GET /api/alerts/stats', () => {
      it('should return alert statistics', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/alerts/stats',
          cookies: { sessionid: sessionCookie || '' },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data.stats.total).toBeDefined();
        expect(body.data.stats.unread).toBeDefined();
        expect(body.data.stats.byType).toBeDefined();
      });
    });
  });

  describe('Dashboard Analytics', () => {
    describe('GET /api/dashboard/kpi', () => {
      it('should return portfolio KPIs', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/dashboard/kpi',
          cookies: { sessionid: sessionCookie || '' },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        const kpi = body.data.kpi;
        expect(kpi.portfolioValue).toBeDefined();
        expect(kpi.monthlyCashflow).toBeDefined();
        expect(kpi.availableEquity).toBeDefined();
        expect(kpi.totalProperties).toBeDefined();
        expect(kpi.activeDeals).toBeDefined();
      });
    });

    describe('GET /api/dashboard/portfolio-trend', () => {
      it('should return portfolio trend data', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/dashboard/portfolio-trend',
          cookies: { sessionid: sessionCookie || '' },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(Array.isArray(body.data.trend)).toBe(true);
      });

      it('should support custom time range', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/dashboard/portfolio-trend?days=30',
          cookies: { sessionid: sessionCookie || '' },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.data.trend.length).toBeLessThanOrEqual(31);
      });
    });

    describe('GET /api/dashboard/deal-flow', () => {
      it('should return deal flow statistics', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/dashboard/deal-flow',
          cookies: { sessionid: sessionCookie || '' },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        const dealFlow = body.data.dealFlow;
        expect(dealFlow.leads).toBeDefined();
        expect(dealFlow.analyzing).toBeDefined();
        expect(dealFlow.offers).toBeDefined();
        expect(dealFlow.under_contract).toBeDefined();
        expect(dealFlow.owned).toBeDefined();
        expect(dealFlow.sold).toBeDefined();
      });
    });

    describe('GET /api/dashboard/property-types', () => {
      it('should return property type breakdown', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/dashboard/property-types',
          cookies: { sessionid: sessionCookie || '' },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        const breakdown = body.data.breakdown;
        expect(breakdown.rent).toBeDefined();
        expect(breakdown.airbnb).toBeDefined();
        expect(breakdown.flip).toBeDefined();
      });
    });

    describe('GET /api/dashboard/recent-activity', () => {
      it('should return recent activity', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/dashboard/recent-activity',
          cookies: { sessionid: sessionCookie || '' },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(Array.isArray(body.data.activity)).toBe(true);
      });
    });
  });

  describe('Authentication Requirement', () => {
    it('should reject property list without auth', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/properties',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should reject dashboard access without auth', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/dashboard/kpi',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should reject alerts access without auth', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/alerts',
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
