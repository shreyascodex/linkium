import { Router } from 'express';
import { checkDatabaseHealth } from '../config/database.js';
import { logger } from '../config/logger.js';
import { sendError, sendSuccess } from '../utils/api-response.js';

export const healthRouter = Router();

healthRouter.get('/', async (req, res) => {
  try {
    await checkDatabaseHealth();

    sendSuccess(res, {
      statusCode: 200,
      message: 'LINKIUM API is running',
      data: {
        status: 'healthy',
        database: 'connected',
      },
    });
  } catch (error) {
    logger.error(
      {
        requestId: req.requestId,
        errName: error instanceof Error ? error.name : 'DatabaseError',
      },
      'Health check failed: database unavailable'
    );

    sendError(res, {
      statusCode: 503,
      message: 'Database is unavailable',
      errors: [
        {
          code: 'DATABASE_UNAVAILABLE',
          message: 'PostgreSQL connection check failed.',
        },
      ],
    });
  }
});
