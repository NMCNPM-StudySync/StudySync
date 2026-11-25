import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { AppError, FileInvalidError } from '../shared/errors';
import type { ApiErrorResponse } from '../shared/response';

export function errorHandler(err: unknown, _req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof AppError) {
    const errorBody: ApiErrorResponse['error'] = {
      code: err.code,
      message: err.message,
    };

    if (err.details && err.details.length > 0) {
      errorBody.details = err.details;
    }

    if (err instanceof FileInvalidError && err.totalErrors !== undefined) {
      errorBody.totalErrors = err.totalErrors;
    }

    res.status(err.statusCode).json({ error: errorBody });
    return;
  }

  // Handle errors from body-parser / express.json()
  if (typeof err === 'object' && err !== null && 'status' in err) {
    const status = (err as { status: unknown }).status;
    if (typeof status === 'number' && status >= 400 && status < 500) {
      if (status === 413 || (err as { type?: unknown }).type === 'entity.too.large') {
        res.status(413).json({
          error: {
            code: 'FILE_TOO_LARGE',
            message: 'Dung lượng yêu cầu vượt quá giới hạn cho phép (BR-05)',
          },
        });
        return;
      }

      const msg =
        err instanceof SyntaxError
          ? 'Dữ liệu JSON trong yêu cầu không đúng định dạng'
          : 'Yêu cầu không hợp lệ';

      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: msg,
        },
      });
      return;
    }
  }

  if (env.nodeEnv !== 'test') {
    // Technical details are logged on server, not exposed to client (BR-02)
    console.error('[Internal Server Error]', err);
  }

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Đã xảy ra lỗi nội bộ máy chủ',
    },
  });
}
