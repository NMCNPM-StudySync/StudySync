import { Router } from 'express';
import { KanbanController } from '../modules/kanban/kanban.controller';
import { createKanbanRouter } from '../modules/kanban/kanban.routes';
import type { KanbanService } from '../modules/kanban/kanban.service';
import { createSampleRouter } from '../modules/sample/sample.routes';
import type { SampleService } from '../modules/sample/sample.service';
import { StatsController } from '../modules/stats/stats.controller';
import { createStatsRouter } from '../modules/stats/stats.routes';
import type { StatsService } from '../modules/stats/stats.service';

export interface ApiRouterOptions {
  sampleService?: SampleService;
  kanbanService?: KanbanService;
  statsService?: StatsService;
}

export function createApiRouter(options?: ApiRouterOptions): Router {
  const router = Router();

  // Modular Route Registrations
  // Module TV5: Quản lý thẻ Kanban nhóm (/api/groups/:groupId/cards...)
  const kanbanController = options?.kanbanService
    ? new KanbanController(options.kanbanService)
    : new KanbanController();
  router.use('/groups', createKanbanRouter(kanbanController));

  // Module TV5: Trích xuất thống kê học tập tuần (/api/statistics/weekly)
  const statsController = options?.statsService
    ? new StatsController(options.statsService)
    : new StatsController();
  router.use('/statistics', createStatsRouter(statsController));

  // Lát cắt mẫu /sample chỉ được kích hoạt trong môi trường test khi truyền sampleService giả lập
  if (options?.sampleService) {
    router.use('/sample', createSampleRouter(options.sampleService));
  }

  return router;
}

export const apiRouter = createApiRouter();
