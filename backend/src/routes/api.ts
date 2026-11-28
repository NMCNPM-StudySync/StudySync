import { Router, type RequestHandler } from 'express';
import type { CalendarImportService } from '../modules/events/calendar-import.service';
import { createEventsRouter } from '../modules/events/events.routes';
import type { FixedEventService } from '../modules/events/events.service';
import { KanbanController } from '../modules/kanban/kanban.controller';
import { createKanbanRouter } from '../modules/kanban/kanban.routes';
import type { KanbanService } from '../modules/kanban/kanban.service';
import {
  createMeetingRouter,
  type MeetingModuleServices,
} from '../modules/meetings/meeting.routes';
import { createAuthMiddleware } from '../middlewares/authenticate';
import { requireAuthenticatedUser } from '../middlewares/require-user';
import { createAuthRouter, createUserRouter } from '../modules/auth/auth.routes';
import type { AuthService } from '../modules/auth/auth.service';
import { createGroupRouter } from '../modules/groups/group.routes';
import type { GroupService } from '../modules/groups/group.service';
import { createSampleRouter } from '../modules/sample/sample.routes';
import type { SampleService } from '../modules/sample/sample.service';
import { createSchedulerRouter } from '../modules/scheduler/scheduler.routes';
import type { SchedulerService } from '../modules/scheduler/scheduler.service';
import type { WeekScheduleService } from '../modules/schedule/schedule.service';
import { createScheduleRouter } from '../modules/schedule/schedule.routes';
import { StatsController } from '../modules/stats/stats.controller';
import { createStatsRouter } from '../modules/stats/stats.routes';
import type { StatsService } from '../modules/stats/stats.service';
import type { TaskService } from '../modules/tasks/tasks.service';
import { createTasksRouter } from '../modules/tasks/tasks.routes';

export interface ApiRouterOptions {
  sampleService?: SampleService;
  /** Dịch vụ xác thực TV1; có thì mount `/api/auth` và `/api/users/me`. */
  auth?: AuthService;
  /** Dịch vụ nhóm TV1; có thì mount `/api/groups` (cần `authenticate` hoặc `auth` để dựng middleware). */
  groups?: GroupService;
  eventsService?: FixedEventService;
  calendarImportService?: CalendarImportService;
  tasksService?: TaskService;
  scheduleService?: WeekScheduleService;
  kanbanService?: KanbanService;
  statsService?: StatsService;
  /** Dịch vụ TV4; có thì mount các endpoint họp nhóm, lời mời, nhắc việc dưới `/api`. */
  meetings?: MeetingModuleServices;
  /** Middleware xác thực dùng chung cho mọi route cần đăng nhập; mặc định dựng từ `auth`. */
  authenticate?: RequestHandler;
  schedulerService?: SchedulerService;
}

export function createApiRouter(options?: ApiRouterOptions): Router {
  const router = Router();

  // Một middleware xác thực dùng chung: ưu tiên `options.authenticate` (ví dụ mock khi test),
  // nếu không có thì dựng từ AuthService. Phải dựng trước khi gắn bất kỳ route cần đăng nhập nào.
  const authenticate =
    options?.authenticate ??
    (options?.auth ? createAuthMiddleware(options.auth.verifyToken.bind(options.auth)) : undefined);
  // Route TV2, TV3 luôn cần đăng nhập. Khi không có `authenticate` (test đơn vị tự gán `req.userId`),
  // dùng `requireAuthenticatedUser` để vẫn trả 401 nếu thiếu người dùng, giống Kanban và Thống kê.
  const requireUser = authenticate ?? requireAuthenticatedUser;

  // TV2 Modules: Quản lý lịch trình cá nhân & Nạp thời khóa biểu (US-08 đến US-15).
  // Middleware xác thực chạy trước `express.raw` của route nạp tệp .ics/.csv.
  router.use(
    '/events',
    requireUser,
    createEventsRouter(options?.eventsService, options?.calendarImportService),
  );
  router.use('/tasks', requireUser, createTasksRouter(options?.tasksService));
  router.use('/schedule', requireUser, createScheduleRouter(options?.scheduleService));

  // Modular Route Registrations
  // Module TV5: Quản lý thẻ Kanban nhóm (/api/groups/:groupId/cards...)
  const kanbanController = options?.kanbanService
    ? new KanbanController(options.kanbanService)
    : new KanbanController();
  router.use('/groups', createKanbanRouter(kanbanController, authenticate));

  // Module TV5: Trích xuất thống kê học tập tuần (/api/statistics/weekly)
  const statsController = options?.statsService
    ? new StatsController(options.statsService)
    : new StatsController();
  router.use('/statistics', createStatsRouter(statsController, authenticate));

  // Lát cắt mẫu /sample chỉ được kích hoạt trong môi trường test khi truyền sampleService giả lập
  if (options?.sampleService) {
    router.use('/sample', createSampleRouter(options.sampleService));
  }

  // TV1: chỉ mount khi server truyền dịch vụ tương ứng; `groups` không phụ thuộc `auth`.
  if (options?.auth && authenticate) {
    router.use('/auth', createAuthRouter(options.auth));
    router.use('/users', createUserRouter(authenticate, options.auth));
  }

  if (options?.groups && authenticate) {
    router.use('/groups', createGroupRouter(authenticate, options.groups));
  }

  // TV4 Modules: Họp nhóm, lời mời, nhắc việc (US-24 đến US-28)
  if (options?.meetings) {
    router.use(createMeetingRouter(options.meetings, authenticate));
  }

  // TV3 - Đề xuất khung giờ học (Issue #119)
  router.use('/scheduler', requireUser, createSchedulerRouter(options?.schedulerService));

  return router;
}
