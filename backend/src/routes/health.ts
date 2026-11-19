import { Router } from 'express';
import { testConnection } from '../config/db';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  try {
    await testConnection();
    res.json({
      status: 'ok',
      database: 'connected',
      time: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      error: (error as Error).message,
      time: new Date().toISOString(),
    });
  }
});
