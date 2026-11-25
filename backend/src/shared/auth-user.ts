import type { Request } from 'express';
import { UnauthorizedError } from './errors';

/**
 * Yêu cầu đã qua middleware xác thực JWT (docs/architecture.md mục 1.1): middleware
 * `authenticate` của TV1 gắn `userId` vào yêu cầu. Khi chưa có middleware này,
 * mọi endpoint cần đăng nhập trả 401.
 */
export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function requireUserId(req: Request): string {
  const userId = (req as AuthenticatedRequest).userId;
  if (typeof userId !== 'string' || userId.length === 0) {
    throw new UnauthorizedError();
  }
  return userId;
}
