import { Router, type RequestHandler } from 'express';
import { GroupController } from './group.controller';
import type { GroupService } from './group.service';

/** Mount tại `/api/groups`; toàn bộ endpoint yêu cầu đăng nhập. */
export function createGroupRouter(authenticate: RequestHandler, service?: GroupService): Router {
  const router = Router();
  const controller = new GroupController(service);
  router.post('/', authenticate, controller.create);
  router.get('/', authenticate, controller.list);
  return router;
}
