import cors, { type CorsOptions } from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { notFoundMiddleware } from './middleware/not-found.middleware.js';
import { requestIdMiddleware } from './middleware/request-id.middleware.js';
import { requestLoggerMiddleware } from './middleware/request-logger.middleware.js';
import { apiV1Router } from './routes/index.js';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  if (env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  app.use(requestIdMiddleware);
  app.use(helmet());

  const corsOptions: CorsOptions = {
    origin(origin, callback) {
      // Allow non-browser / server-to-server requests without an Origin header
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
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  };

  app.use(cors(corsOptions));
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));
  app.use(requestLoggerMiddleware);

  app.use('/api/v1', apiV1Router);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}

export const app = createApp();
