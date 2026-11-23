import express from 'express';
import { env } from './config/env';
import { errorHandler } from './middlewares/error-handler';
import { notFoundHandler } from './middlewares/not-found-handler';
import type { ApiRouterOptions } from './routes/api';
import { createApiRouter } from './routes/api';
import { healthRouter } from './routes/health';

export type AppOptions = ApiRouterOptions;

export function createApp(options?: AppOptions) {
  const app = express();

  // Basic CORS support adhering to env.corsOrigin
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', env.corsOrigin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    );

    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }

    next();
  });

  app.use(express.json());

  // Health check endpoint (outside /api prefix per docs/api.md convention)
  app.use('/health', healthRouter);

  // Core API endpoints with /api prefix
  app.use('/api', createApiRouter(options));

  // Catch-all 404 handler for unmatched routes
  app.use(notFoundHandler);

  // Global Error Handler middleware
  app.use(errorHandler);

  return app;
}
