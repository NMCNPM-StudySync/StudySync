import { Router, type RequestHandler } from 'express';
import { requireAuthenticatedUser } from '../../middlewares/require-user';
import { StatsController } from './stats.controller';

export function createStatsRouter(
  controller: StatsController = new StatsController(),
  authenticate: RequestHandler = requireAuthenticatedUser,
): Router {
  const router = Router();

  router.get('/weekly', authenticate, controller.getWeeklyStats);

  return router;
}

export const statsRouter = createStatsRouter();
