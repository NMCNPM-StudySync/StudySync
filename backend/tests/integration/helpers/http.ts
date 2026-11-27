import type { RequestHandler } from 'express';
import request from 'supertest';
import { expect } from 'vitest';
import { createApp } from '../../../src/app';
import { createAuthMiddleware } from '../../../src/middlewares/authenticate';
import { AuthService } from '../../../src/modules/auth/auth.service';
import { GroupService } from '../../../src/modules/groups/group.service';
import { createMeetingsModule } from '../../../src/modules/meetings/meetings.module';

let app: ReturnType<typeof createApp> | undefined;

/**
 * Middleware giải mã JWT Bearer cho các route TV2/TV3 vốn chưa gắn `authenticate` trong `routes/api.ts`.
 * Không tự chặn request thiếu/sai token để giữ nguyên các route công khai (`/api/auth/*`, `GET /api/invitations/:token`);
 * các route cần đăng nhập vẫn tự trả 401 khi `req.userId` rỗng (qua `authenticate`, `getUserId`, `requireUserId`).
 */
function createBearerHydrator(auth: AuthService): RequestHandler {
  return (req, _res, next) => {
    const header = req.headers.authorization;
    const match = typeof header === 'string' ? /^Bearer\s+(\S+)$/i.exec(header.trim()) : null;
    if (match) {
      try {
        req.userId = auth.verifyToken(match[1]!);
      } catch {
        // Giữ req.userId = undefined để middleware/controller của route trả 401 UNAUTHORIZED.
      }
    }
    next();
  };
}

/**
 * Supertest gọi thẳng vào Express app (không mở cổng mạng), lắp đủ 5 module giống `src/server.ts`
 * (không gọi `reminderJob.start()` để tránh mở interval nền làm treo Vitest).
 */
export function getApp(): ReturnType<typeof createApp> {
  if (!app) {
    const auth = new AuthService(undefined, undefined, { bcryptCost: 4 });
    const groups = new GroupService();
    const meetings = createMeetingsModule();
    app = createApp({
      auth,
      groups,
      meetings: meetings.services,
      authenticate: createAuthMiddleware(auth.verifyToken.bind(auth)),
      authMiddleware: createBearerHydrator(auth),
    });
  }
  return app;
}

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

export function as(actor?: { token: string }) {
  const make =
    (method: Method) =>
    (path: string, body?: object): request.Test => {
      let req = request(getApp())[method](path);
      if (actor) req = req.set('Authorization', `Bearer ${actor.token}`);
      if (body !== undefined) req = req.send(body);
      return req;
    };
  return {
    get: make('get'),
    post: make('post'),
    put: make('put'),
    patch: make('patch'),
    del: make('delete'),
  };
}

export function withQuery(path: string, query: Record<string, string | number>): string {
  const qs = new URLSearchParams(
    Object.entries(query).map(([k, v]) => [k, String(v)] as [string, string]),
  );
  return `${path}?${qs.toString()}`;
}

/** Kiểm tra mã HTTP, in cả body khi sai để dễ chẩn đoán. */
export function expectStatus(res: request.Response, status: number): void {
  expect(res.status, `HTTP ${res.status}: ${JSON.stringify(res.body)}`).toBe(status);
}

/** Kiểm tra dạng lỗi thống nhất { error: { code, message } } và không có data (docs/api.md). */
export function expectError(res: request.Response, status: number, code: string): void {
  expectStatus(res, status);
  expect(res.body.data).toBeUndefined();
  expect(res.body.error?.code).toBe(code);
  expect(typeof res.body.error?.message).toBe('string');
}
