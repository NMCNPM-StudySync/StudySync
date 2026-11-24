import { Router, type RequestHandler } from 'express';
import { KanbanController } from '../modules/kanban/kanban.controller';
import { createKanbanRouter } from '../modules/kanban/kanban.routes';
import type { KanbanService } from '../modules/kanban/kanban.service';
import {
  createMeetingRouter,
  type MeetingModuleServices,
} from '../modules/meetings/meeting.routes';
import { createSampleRouter } from '../modules/sample/sample.routes';
import type { SampleService } from '../modules/sample/sample.service';
import { StatsController } from '../modules/stats/stats.controller';
import { createStatsRouter } from '../modules/stats/stats.routes';
import type { StatsService } from '../modules/stats/stats.service';

export interface ApiRouterOptions {
  sampleService?: SampleService;
  kanbanService?: KanbanService;
  statsService?: StatsService;
  /** Dịch vụ TV4; có thì mount các endpoint họp nhóm, lời mời, nhắc việc dưới `/api`. */
  meetings?: MeetingModuleServices;
  /** Middleware xác thực JWT của TV1; mặc định chỉ kiểm tra `req.userId`. */
  authenticate?: RequestHandler;
}

export function createApiRouter(options?: ApiRouterOptions): Router {
  const router = Router();

  // Modular Route Registrations
  // Module TV5: Quản lý thẻ Kanban nhóm (/api/groups/:groupId/cards...)
  const kanbanController = options?.kanbanService
    ? new KanbanController(options.kanbanService)
    : new KanbanController();
  router.use('/groups', createKanbanRouter(kanbanController, options?.authenticate));

  // Module TV5: Trích xuất thống kê học tập tuần (/api/statistics/weekly)
  const statsController = options?.statsService
    ? new StatsController(options.statsService)
    : new StatsController();
  router.use('/statistics', createStatsRouter(statsController, options?.authenticate));

  // Lát cắt mẫu /sample chỉ được kích hoạt trong môi trường test khi truyền sampleService giả lập
  if (options?.sampleService) {
    router.use('/sample', createSampleRouter(options.sampleService));
  }

  if (options?.meetings) {
    router.use(createMeetingRouter(options.meetings, options.authenticate));
  }

  return router;
}
