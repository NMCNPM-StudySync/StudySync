import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { UnauthorizedError } from '../shared/errors';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Do middleware xác thực của TV1 gán sau khi kiểm tra JWT. */
      userId?: string;
    }
  }
}

/**
 * Bản giữ chỗ cho `authenticate` của TV1: chỉ yêu cầu `req.userId` đã được middleware JWT gán.
 * Khi TV1 merge, thay bằng middleware thật ở `routes/api.ts`; module TV4 chỉ đọc `req.userId`.
 */
export const requireAuthenticatedUser: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.userId) {
    next(new UnauthorizedError());
    return;
  }
  next();
};

export function getAuthUserId(req: Request): string {
  if (!req.userId) {
    throw new UnauthorizedError();
  }
  return req.userId;
}
