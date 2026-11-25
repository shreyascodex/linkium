import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:password@localhost:5432/linkium';
  console.warn(
    '[LINKIUM] DATABASE_URL is not configured; API database endpoints will return 503 until PostgreSQL is connected.'
  );
}

if (isProduction && !process.env.DATABASE_URL) {
  console.error('[LINKIUM] Fatal: DATABASE_URL is required when NODE_ENV=production.');
  process.exit(1);
}

const existingOrigins = (process.env.FRONTEND_URL ?? '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

if (!isProduction) {
  const devOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    process.env.APP_URL,
  ].filter((value): value is string => Boolean(value && value.trim()));

  process.env.FRONTEND_URL = Array.from(new Set([...existingOrigins, ...devOrigins])).join(',');
} else if (existingOrigins.length === 0 && process.env.APP_URL?.trim()) {
  process.env.FRONTEND_URL = process.env.APP_URL.trim();
}

if (!process.env.APP_BASE_URL) {
  if (!isProduction) {
    process.env.APP_BASE_URL = process.env.APP_URL || 'http://localhost:3000';
  } else if (process.env.APP_URL?.trim()) {
    process.env.APP_BASE_URL = process.env.APP_URL.trim();
  }
}

if (!process.env.COOKIE_SAME_SITE && process.env.APP_URL?.startsWith('https://')) {
  process.env.COOKIE_SAME_SITE = 'none';
}

const backendAppModulePath = isProduction
  ? './backend/dist/app.js'
  : './backend/src/app.js';
const backendDbModulePath = isProduction
  ? './backend/dist/config/database.js'
  : './backend/src/config/database.js';

const { createApiRouter } = (await import(backendAppModulePath)) as {
  createApiRouter: () => express.Router;
};
const { disconnectDatabase } = (await import(backendDbModulePath)) as {
  disconnectDatabase: () => Promise<void>;
};

async function startServer() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  // Mount full backend API on /api (/api/v1/health, /api/v1/auth/*, /api/v1/profiles/*, etc.)
  app.use('/api', createApiRouter());

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    const indexHtml = path.join(distDir, 'index.html');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
        return;
      }
      res.status(404).send('Frontend build not found. Run npm run build.');
    });
  }

  const port = Number(process.env.PORT) || 3000;
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`[LINKIUM] Full-stack server running on http://0.0.0.0:${port}`);
  });

  let shuttingDown = false;
  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[LINKIUM] Received ${signal}, shutting down...`);
    server.close(async () => {
      await disconnectDatabase().catch(() => undefined);
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

void startServer();
