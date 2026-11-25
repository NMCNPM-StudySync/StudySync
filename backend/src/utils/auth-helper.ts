import type { Request } from 'express';
import { UnauthorizedError } from '../shared/errors';

/**
 * Trích xuất định danh người dùng (userId) từ request theo kiến trúc chuẩn (docs/architecture.md).
 * Chỉ đọc req.userId (hoặc req.user.id) đã được xác thực an toàn qua middleware JWT của TV1.
 * Thiếu thông tin người dùng ném lỗi UnauthorizedError (HTTP 401).
 */
export function getUserId(req: Request): string {
  const customReq = req as unknown as { userId?: string; user?: { id?: string } };
  const userId = customReq.userId ?? customReq.user?.id;

  if (typeof userId === 'string' && userId.trim().length > 0) {
    return userId.trim();
  }

  throw new UnauthorizedError('Chưa đăng nhập hoặc phiên làm việc đã hết hạn');
}
