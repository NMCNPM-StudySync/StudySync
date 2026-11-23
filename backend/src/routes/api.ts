import { Router } from 'express';
import type { CalendarImportService } from '../modules/events/calendar-import.service';
import { createEventsRouter } from '../modules/events/events.routes';
import type { FixedEventService } from '../modules/events/events.service';
import type { SampleService } from '../modules/sample/sample.service';
import { createSampleRouter } from '../modules/sample/sample.routes';
import type { WeekScheduleService } from '../modules/schedule/schedule.service';
import { createScheduleRouter } from '../modules/schedule/schedule.routes';
import type { TaskService } from '../modules/tasks/tasks.service';
import { createTasksRouter } from '../modules/tasks/tasks.routes';

export interface ApiRouterOptions {
  sampleService?: SampleService;
  eventsService?: FixedEventService;
  calendarImportService?: CalendarImportService;
  tasksService?: TaskService;
  scheduleService?: WeekScheduleService;
}

export function createApiRouter(options?: ApiRouterOptions): Router {
  const router = Router();

  // TV2 Modules: Quản lý lịch trình cá nhân & Nạp thời khóa biểu (US-08 đến US-15)
  router.use('/events', createEventsRouter(options?.eventsService, options?.calendarImportService));
  router.use('/tasks', createTasksRouter(options?.tasksService));
  router.use('/schedule', createScheduleRouter(options?.scheduleService));

  // Lát cắt mẫu /sample chỉ được kích hoạt trong môi trường test khi truyền sampleService giả lập
  if (options?.sampleService) {
    router.use('/sample', createSampleRouter(options.sampleService));
  }

  return router;
}

export const apiRouter = createApiRouter();
