import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { UnauthorizedError } from '../shared/errors';

/**
 * Middleware xác thực JWT Bearer: đọc `Authorization: Bearer <token>`, kiểm tra token
 * và gán `req.userId` (khai báo kiểu ở require-user.ts) cho các handler phía sau.
 */
export function createAuthMiddleware(verifyToken: (token: string) => string): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    const match = typeof header === 'string' ? /^Bearer\s+(\S+)$/i.exec(header.trim()) : null;
    if (!match) {
      next(new UnauthorizedError());
      return;
    }
    try {
      req.userId = verifyToken(match[1]!);
      next();
    } catch (err) {
      next(err);
    }
  };
}
