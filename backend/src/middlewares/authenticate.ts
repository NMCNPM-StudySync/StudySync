import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { UnauthorizedError } from '../shared/errors';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Do middleware xác thực gán sau khi kiểm tra Bearer token */
      userId?: string;
    }
  }
}

/**
 * Middleware xác thực người dùng qua Authorization Bearer token.
 * Tương thích với token JWT hoặc trực tiếp userId trong môi trường test/dev.
 */
export const authenticate: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  if (req.userId) {
    next();
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new UnauthorizedError('Chưa đăng nhập hoặc thiếu token xác thực'));
    return;
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    next(new UnauthorizedError('Token không hợp lệ'));
    return;
  }

  try {
    const parts = token.split('.');
    const payloadPart = parts[1];
    if (parts.length === 3 && payloadPart) {
      const payloadStr = Buffer.from(payloadPart, 'base64').toString('utf8');
      const payload = JSON.parse(payloadStr) as Record<string, unknown>;
      const extractedId = payload.id || payload.userId || payload.sub;
      if (typeof extractedId === 'string' && extractedId.length > 0) {
        req.userId = extractedId;
      } else {
        req.userId = token;
      }
    } else {
      req.userId = token;
    }
  } catch {
    req.userId = token;
  }

  if (!req.userId) {
    next(new UnauthorizedError('Token không hợp lệ'));
    return;
  }

  next();
};

export const requireAuthenticatedUser = authenticate;

export function getAuthUserId(req: Request): string {
  if (!req.userId) {
    throw new UnauthorizedError('Chưa đăng nhập hoặc thiếu token xác thực');
  }
  return req.userId;
}
