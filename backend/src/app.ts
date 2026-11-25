import cookieParser from 'cookie-parser';
import cors, { type CorsOptions } from 'cors';
import express, { Router, type Express } from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { notFoundMiddleware } from './middleware/not-found.middleware.js';
import { requestIdMiddleware } from './middleware/request-id.middleware.js';
import { requestLoggerMiddleware } from './middleware/request-logger.middleware.js';
import { apiV1Router } from './routes/index.js';

export function createApiRouter(): Router {
  const apiRouter = Router();

  apiRouter.use(requestIdMiddleware);
  apiRouter.use(
    helmet({
      contentSecurityPolicy: false,
      frameguard: false,
    })
  );

  const corsOptions: CorsOptions = {
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (env.FRONTEND_ORIGINS.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'X-CSRF-Token'],
  };

  apiRouter.use(cors(corsOptions));
  apiRouter.use(cookieParser());
  apiRouter.use(express.json({ limit: '100kb' }));
  apiRouter.use(express.urlencoded({ extended: true, limit: '100kb' }));
  apiRouter.use(requestLoggerMiddleware);

  apiRouter.use('/v1', apiV1Router);

  apiRouter.use(notFoundMiddleware);
  apiRouter.use(errorMiddleware);

  return apiRouter;
}

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  if (env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  app.use('/api', createApiRouter());
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}

export const app = createApp();
