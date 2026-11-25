import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

const { mockCheckDatabaseHealth } = vi.hoisted(() => ({
  mockCheckDatabaseHealth: vi.fn<() => Promise<void>>(),
}));

vi.mock('../src/config/database.js', () => ({
  checkDatabaseHealth: mockCheckDatabaseHealth,
  disconnectDatabase: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
  prisma: {},
}));

import { app } from '../src/app.js';
import { parseEnv } from '../src/config/env.js';
import { errorMiddleware } from '../src/middleware/error.middleware.js';
import { notFoundMiddleware } from '../src/middleware/not-found.middleware.js';
import { validateRequest } from '../src/middleware/validate.middleware.js';
import { sendSuccess } from '../src/utils/api-response.js';

describe('LINKIUM Backend Foundation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/health', () => {
    it('returns 200 and healthy database status when PostgreSQL is connected', async () => {
      mockCheckDatabaseHealth.mockResolvedValueOnce(undefined);

      const response = await request(app).get('/api/v1/health');

      expect(response.status).toBe(200);
      expect(response.headers['x-request-id']).toBeDefined();
      expect(response.body).toEqual({
        success: true,
        message: 'LINKIUM API is running',
        data: {
          status: 'healthy',
          database: 'connected',
        },
      });
      expect(mockCheckDatabaseHealth).toHaveBeenCalledTimes(1);
    });

    it('returns 503 when PostgreSQL is unavailable without leaking credentials', async () => {
      mockCheckDatabaseHealth.mockRejectedValueOnce(
        new Error('Connection refused: postgresql://postgres:secret@localhost:5432/linkium')
      );

      const response = await request(app).get('/api/v1/health');

      expect(response.status).toBe(503);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Database is unavailable');
      expect(response.body.errors).toEqual([
        {
          code: 'DATABASE_UNAVAILABLE',
          message: 'PostgreSQL connection check failed.',
        },
      ]);

      const serialized = JSON.stringify(response.body);
      expect(serialized).not.toContain('postgresql://');
      expect(serialized).not.toContain('secret');
    });
  });

  describe('404 Not Found handling', () => {
    it('returns 404 with standardized error shape for unknown routes', async () => {
      const response = await request(app).get('/api/v1/non-existent-route');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        message: 'Route GET /api/v1/non-existent-route not found',
        errors: [
          {
            code: 'ROUTE_NOT_FOUND',
            message: 'The requested endpoint does not exist.',
          },
        ],
      });
    });
  });

  describe('Request validation and malformed input handling', () => {
    it('returns 400 when malformed JSON is sent in request body', async () => {
      const response = await request(app)
        .post('/api/v1/health')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid JSON request body');
      expect(response.body.errors[0]?.code).toBe('INVALID_JSON');
    });

    it('validates request payloads via validateRequest middleware and returns 400 on invalid input', async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.post(
        '/test-validate',
        validateRequest({
          body: z.object({
            email: z.string().email('Valid email required'),
          }),
        }),
        (req, res) => {
          sendSuccess(res, { message: 'Valid', data: req.body });
        }
      );
      testApp.use(notFoundMiddleware);
      testApp.use(errorMiddleware);

      const invalidRes = await request(testApp)
        .post('/test-validate')
        .send({ email: 'not-an-email' });

      expect(invalidRes.status).toBe(400);
      expect(invalidRes.body.success).toBe(false);
      expect(invalidRes.body.message).toBe('Invalid request data');
      expect(invalidRes.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'body.email',
            message: 'Valid email required',
          }),
        ])
      );

      const validRes = await request(testApp)
        .post('/test-validate')
        .send({ email: 'builder@linkium.example.org' });

      expect(validRes.status).toBe(200);
      expect(validRes.body.success).toBe(true);
      expect(validRes.body.data).toEqual({ email: 'builder@linkium.example.org' });
    });
  });

  describe('Error sanitization & CORS security', () => {
    it('does not expose stack traces or database connection details on unhandled errors', async () => {
      const testApp = express();
      testApp.get('/boom', () => {
        throw new Error(
          'FATAL: password authentication failed for postgresql://postgres:supersecret@db.internal:5432/prod'
        );
      });
      testApp.use(errorMiddleware);

      const response = await request(testApp).get('/boom');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Internal server error',
        errors: [],
      });

      const serialized = JSON.stringify(response.body);
      expect(serialized).not.toContain('supersecret');
      expect(serialized).not.toContain('postgresql://');
      expect(serialized).not.toContain('at ');
    });

    it('rejects disallowed CORS origins', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .set('Origin', 'https://untrusted-site.example.com');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.errors[0]?.code).toBe('CORS_FORBIDDEN');
    });
  });

  describe('Environment validation', () => {
    it('rejects missing or invalid DATABASE_URL', () => {
      expect(() =>
        parseEnv({
          NODE_ENV: 'development',
          PORT: '5000',
          DATABASE_URL: 'mysql://localhost:3306/bad',
          FRONTEND_URL: 'http://localhost:5173',
        })
      ).toThrowError(/DATABASE_URL must be a valid PostgreSQL connection string/);
    });

    it('parses comma-separated FRONTEND_URL origins cleanly', () => {
      const parsed = parseEnv({
        NODE_ENV: 'development',
        PORT: '5000',
        DATABASE_URL: 'postgresql://postgres:password@localhost:5432/linkium',
        FRONTEND_URL: 'http://localhost:3000, http://localhost:5173',
        LOG_LEVEL: 'info',
      });

      expect(parsed.FRONTEND_ORIGINS).toEqual([
        'http://localhost:3000',
        'http://localhost:5173',
      ]);
    });
  });
});
