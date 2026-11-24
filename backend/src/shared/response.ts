import type { Response } from 'express';
import type { ErrorDetail } from './errors';

export interface ApiWarning {
  code: string;
  message: string;
  details?: Array<{ field?: string; issue: string }>;
}

export interface ApiSuccessResponse<T> {
  data: T;
  warnings?: ApiWarning[];
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: ErrorDetail[];
    totalErrors?: number;
  };
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  warnings?: ApiWarning[],
): void {
  const payload: ApiSuccessResponse<T> = { data };

  if (warnings && warnings.length > 0) {
    payload.warnings = warnings;
  }

  res.status(statusCode).json(payload);
}

export function sendNoContent(res: Response): void {
  res.status(204).end();
}
