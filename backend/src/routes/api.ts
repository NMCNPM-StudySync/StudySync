import { Router } from 'express';
import { createSampleRouter } from '../modules/sample/sample.routes';
import type { SampleService } from '../modules/sample/sample.service';

export interface ApiRouterOptions {
  sampleService?: SampleService;
}

export function createApiRouter(options?: ApiRouterOptions): Router {
  const router = Router();

  // Modular Route Registrations
  // Các module TV1-TV5 sẽ cắm router nghiệp vụ tại đây theo docs/architecture.md
  // Lát cắt mẫu /sample chỉ được kích hoạt trong môi trường test khi truyền sampleService giả lập
  if (options?.sampleService) {
    router.use('/sample', createSampleRouter(options.sampleService));
  }

  return router;
}

export const apiRouter = createApiRouter();
