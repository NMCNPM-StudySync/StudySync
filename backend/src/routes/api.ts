import { Router, type RequestHandler } from 'express';
import {
  createMeetingRouter,
  type MeetingModuleServices,
} from '../modules/meetings/meeting.routes';
import { createSampleRouter } from '../modules/sample/sample.routes';
import type { SampleService } from '../modules/sample/sample.service';

export interface ApiRouterOptions {
  sampleService?: SampleService;
  /** Dịch vụ TV4; có thì mount các endpoint họp nhóm, lời mời, nhắc việc dưới `/api`. */
  meetings?: MeetingModuleServices;
  /** Middleware xác thực JWT của TV1; mặc định chỉ kiểm tra `req.userId`. */
  authenticate?: RequestHandler;
}

export function createApiRouter(options?: ApiRouterOptions): Router {
  const router = Router();

  // Modular Route Registrations
  // Các module TV1-TV5 sẽ cắm router nghiệp vụ tại đây theo docs/architecture.md
  // Lát cắt mẫu /sample chỉ được kích hoạt trong môi trường test khi truyền sampleService giả lập
  if (options?.sampleService) {
    router.use('/sample', createSampleRouter(options.sampleService));
  }

  if (options?.meetings) {
    router.use(createMeetingRouter(options.meetings, options.authenticate));
  }

  return router;
}
