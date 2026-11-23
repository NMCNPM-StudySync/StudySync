import { Router, type RequestHandler } from 'express';
import { AuthController } from './auth.controller';
import type { AuthService } from './auth.service';

/** Mount tại `/api/auth` (công khai). */
export function createAuthRouter(service?: AuthService): Router {
  const router = Router();
  const controller = new AuthController(service);
  router.post('/register', controller.register);
  router.post('/login', controller.login);
  return router;
}

/** Mount tại `/api/users` (cần đăng nhập). */
export function createUserRouter(authenticate: RequestHandler, service?: AuthService): Router {
  const router = Router();
  const controller = new AuthController(service);
  router.get('/me', authenticate, controller.me);
  return router;
}
