import type { Request } from 'express';
import { UnauthorizedError } from '../shared/errors';

/**
 * Trích xuất định danh người dùng (userId) từ request.
 * Hỗ trợ req.user.id (từ middleware xác thực JWT của TV1)
 * hoặc header x-user-id / Bearer token.
 */
export function getUserId(req: Request): string {
  const customReq = req as unknown as { user?: { id?: string } };
  if (customReq.user?.id) {
    return customReq.user.id;
  }

  const headerUserId = req.headers['x-user-id'];
  if (typeof headerUserId === 'string' && headerUserId.trim().length > 0) {
    return headerUserId.trim();
  }

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token) return token;
  }

  throw new UnauthorizedError('Chưa đăng nhập hoặc phiên làm việc đã hết hạn');
}
