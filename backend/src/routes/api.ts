import { Router, type RequestHandler } from 'express';
import type { CalendarImportService } from '../modules/events/calendar-import.service';
import { createEventsRouter } from '../modules/events/events.routes';
import type { FixedEventService } from '../modules/events/events.service';
import {
  createMeetingRouter,
  type MeetingModuleServices,
} from '../modules/meetings/meeting.routes';
import { createSampleRouter } from '../modules/sample/sample.routes';
import type { SampleService } from '../modules/sample/sample.service';
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
  /** Dịch vụ TV4; có thì mount các endpoint họp nhóm, lời mời, nhắc việc dưới `/api`. */
  meetings?: MeetingModuleServices;
  /** Middleware xác thực JWT của TV1; mặc định chỉ kiểm tra `req.userId`. */
  authenticate?: RequestHandler;
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

  // TV4 Modules: Họp nhóm, lời mời, nhắc việc (US-24 đến US-28)
  if (options?.meetings) {
    router.use(createMeetingRouter(options.meetings, options.authenticate));
  }

  return router;
}
