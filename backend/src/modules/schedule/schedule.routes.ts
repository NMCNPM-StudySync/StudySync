import { Router } from 'express';
import { ScheduleController } from './schedule.controller';
import { WeekScheduleService } from './schedule.service';

export function createScheduleRouter(service?: WeekScheduleService): Router {
  const router = Router();
  const controller = new ScheduleController(service);

  router.get('/week', controller.getWeek);

  return router;
}

export const scheduleRouter = createScheduleRouter();
