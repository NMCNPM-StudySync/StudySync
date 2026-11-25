import { Router } from 'express';
import { SchedulerController } from './scheduler.controller';
import type { SchedulerService } from './scheduler.service';

/** Gắn tại /api/scheduler (docs/api.md, Danh sách endpoint TV3). */
export function createSchedulerRouter(service?: SchedulerService): Router {
  const router = Router();
  const controller = new SchedulerController(service);

  router.post('/auto-plan', controller.autoPlan);
  router.post('/missed-session', controller.missedSession);
  router.post('/completed-session', controller.completedSession);

  return router;
}
