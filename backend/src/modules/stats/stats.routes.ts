import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { StatsController } from './stats.controller';

export function createStatsRouter(controller: StatsController = new StatsController()): Router {
  const router = Router();

  router.get('/weekly', authenticate, controller.getWeeklyStats);

  return router;
}

export const statsRouter = createStatsRouter();
