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
  /** Dịch vụ nhóm TV1; cần kèm `auth` để mount `/api/groups`. */
  groups?: GroupService;
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

  // TV1: xác thực, thông tin cá nhân và nhóm; chỉ mount khi server truyền AuthService/GroupService
  if (options?.auth) {
    router.use('/auth', createAuthRouter(options.auth));
    router.use(
      '/users',
      createUserRouter(
        createAuthMiddleware(options.auth.verifyToken.bind(options.auth)),
        options.auth,
      ),
    );
  }

  if (options?.auth && options.groups) {
    const authenticate = createAuthMiddleware(options.auth.verifyToken.bind(options.auth));
    router.use('/groups', createGroupRouter(authenticate, options.groups));
  }

  if (options?.meetings) {
    router.use(createMeetingRouter(options.meetings, options.authenticate));
  }

  return router;
}
