import { Router, type RequestHandler } from 'express';
import {
  createMeetingRouter,
  type MeetingModuleServices,
} from '../modules/meetings/meeting.routes';
import { createAuthMiddleware } from '../middlewares/authenticate';
import { createAuthRouter, createUserRouter } from '../modules/auth/auth.routes';
import type { AuthService } from '../modules/auth/auth.service';
import { createGroupRouter } from '../modules/groups/group.routes';
import type { GroupService } from '../modules/groups/group.service';
import { createSampleRouter } from '../modules/sample/sample.routes';
import type { SampleService } from '../modules/sample/sample.service';

export interface ApiRouterOptions {
  sampleService?: SampleService;
  /** Dịch vụ xác thực TV1; có thì mount `/api/auth` và `/api/users/me`. */
  auth?: AuthService;
  /** Dịch vụ nhóm TV1; có thì mount `/api/groups` (cần `authenticate` hoặc `auth` để dựng middleware). */
  groups?: GroupService;
  /** Dịch vụ TV4; có thì mount các endpoint họp nhóm, lời mời, nhắc việc dưới `/api`. */
  meetings?: MeetingModuleServices;
  /** Middleware xác thực dùng chung cho mọi route cần đăng nhập; mặc định dựng từ `auth`. */
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

  // Một middleware xác thực dùng chung: ưu tiên `options.authenticate` (ví dụ mock khi test),
  // nếu không có thì dựng từ AuthService.
  const authenticate =
    options?.authenticate ??
    (options?.auth ? createAuthMiddleware(options.auth.verifyToken.bind(options.auth)) : undefined);

  // TV1: chỉ mount khi server truyền dịch vụ tương ứng; `groups` không phụ thuộc `auth`.
  if (options?.auth && authenticate) {
    router.use('/auth', createAuthRouter(options.auth));
    router.use('/users', createUserRouter(authenticate, options.auth));
  }

  if (options?.groups && authenticate) {
    router.use('/groups', createGroupRouter(authenticate, options.groups));
  }

  if (options?.meetings) {
    router.use(createMeetingRouter(options.meetings, authenticate));
  }

  return router;
}
