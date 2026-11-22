import { Router } from 'express';
import { createSampleRouter } from '../modules/sample/sample.routes';
import type { SampleService } from '../modules/sample/sample.service';
import { createSchedulerRouter } from '../modules/scheduler/scheduler.routes';
import type { SchedulerService } from '../modules/scheduler/scheduler.service';

export interface ApiRouterOptions {
  sampleService?: SampleService;
  schedulerService?: SchedulerService;
}

export function createApiRouter(options?: ApiRouterOptions): Router {
  const router = Router();

  // Modular Route Registrations
  // Các module TV1-TV5 sẽ cắm router nghiệp vụ tại đây theo docs/architecture.md
  // Lát cắt mẫu /sample chỉ được kích hoạt trong môi trường test khi truyền sampleService giả lập
  if (options?.sampleService) {
    router.use('/sample', createSampleRouter(options.sampleService));
  }

  // TV3 - Đề xuất khung giờ học (Issue #119)
  router.use('/scheduler', createSchedulerRouter(options?.schedulerService));

  return router;
}

export const apiRouter = createApiRouter();
