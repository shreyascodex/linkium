import { app } from './app.js';
import { disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

const server = app.listen(env.PORT, () => {
  logger.info(
    {
      port: env.PORT,
      env: env.NODE_ENV,
      allowedOrigins: env.FRONTEND_ORIGINS,
    },
    `LINKIUM API server listening on port ${env.PORT}`
  );
});

let isShuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;

  logger.info({ signal }, 'Graceful shutdown initiated');

  server.close(async (closeErr) => {
    if (closeErr) {
      logger.error({ errMessage: closeErr.message }, 'Error closing HTTP server');
    }

    try {
      await disconnectDatabase();
      logger.info('Database connections closed');
      process.exit(closeErr ? 1 : 0);
    } catch (dbErr) {
      logger.error(
        { errMessage: dbErr instanceof Error ? dbErr.message : 'Unknown error' },
        'Error disconnecting database'
      );
      process.exit(1);
    }
  });
}

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});
