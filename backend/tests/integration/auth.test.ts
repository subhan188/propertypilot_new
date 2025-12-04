import { createApp } from '@/app';
import { prisma } from '@/db/prisma';
import { FastifyInstance } from 'fastify';

describe('Authentication Routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    // Clean up database
    await prisma.user.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.user.email).toBe('newuser@example.com');
      expect(body.data.user.name).toBe('New User');
      expect(body.data.user.password).toBeUndefined();
    });

    it('should reject duplicate email', async () => {
      // Register first user
      await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'duplicate@example.com',
          password: 'password123',
          name: 'User One',
        },
      });

      // Try to register with same email
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'duplicate@example.com',
          password: 'password456',
          name: 'User Two',
        },
      });

      expect(response.statusCode).toBe(409);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toContain('already registered');
    });

    it('should validate email format', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'invalid-email',
          password: 'password123',
          name: 'User',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    it('should validate password length', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'short@example.com',
          password: 'short',
          name: 'User',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'login@example.com',
          password: 'password123',
          name: 'Login Test User',
        },
      });
    });

    it('should login with valid credentials', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'login@example.com',
          password: 'password123',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.user.email).toBe('login@example.com');
      expect(response.cookies.length).toBeGreaterThan(0);
    });

    it('should reject invalid email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'nonexistent@example.com',
          password: 'password123',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    it('should reject invalid password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'login@example.com',
          password: 'wrongpassword',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    let sessionCookie: string | undefined;

    beforeEach(async () => {
      // Register and login
      await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'me@example.com',
          password: 'password123',
          name: 'Me User',
        },
      });

      const loginResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'me@example.com',
          password: 'password123',
        },
      });

      const cookies = loginResponse.headers['set-cookie'];
      sessionCookie = Array.isArray(cookies) ? cookies[0] : cookies;
    });

    it('should return authenticated user', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        cookies: { sessionid: sessionCookie || '' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.user.email).toBe('me@example.com');
    });

    it('should reject unauthenticated requests', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout user', async () => {
      // Register and login
      await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'logout@example.com',
          password: 'password123',
          name: 'Logout User',
        },
      });

      const loginResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'logout@example.com',
          password: 'password123',
        },
      });

      const cookies = loginResponse.headers['set-cookie'];
      const sessionCookie = Array.isArray(cookies) ? cookies[0] : cookies;

      const logoutResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/logout',
        cookies: { sessionid: sessionCookie || '' },
      });

      expect(logoutResponse.statusCode).toBe(200);
      const body = JSON.parse(logoutResponse.body);
      expect(body.success).toBe(true);
    });
  });

  describe('PUT /api/auth/password', () => {
    beforeEach(async () => {
      // Register a user
      await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'password@example.com',
          password: 'oldpassword123',
          name: 'Password User',
        },
      });
    });

    it('should change password with correct old password', async () => {
      // Login first
      const loginResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'password@example.com',
          password: 'oldpassword123',
        },
      });

      const cookies = loginResponse.headers['set-cookie'];
      const sessionCookie = Array.isArray(cookies) ? cookies[0] : cookies;

      // Change password
      const response = await app.inject({
        method: 'PUT',
        url: '/api/auth/password',
        cookies: { sessionid: sessionCookie || '' },
        payload: {
          currentPassword: 'oldpassword123',
          newPassword: 'newpassword123',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);

      // Try to login with new password
      const newLoginResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'password@example.com',
          password: 'newpassword123',
        },
      });

      expect(newLoginResponse.statusCode).toBe(200);
    });

    it('should reject wrong current password', async () => {
      const loginResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'password@example.com',
          password: 'oldpassword123',
        },
      });

      const cookies = loginResponse.headers['set-cookie'];
      const sessionCookie = Array.isArray(cookies) ? cookies[0] : cookies;

      const response = await app.inject({
        method: 'PUT',
        url: '/api/auth/password',
        cookies: { sessionid: sessionCookie || '' },
        payload: {
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('ok');
      expect(body.timestamp).toBeDefined();
    });
  });
});
