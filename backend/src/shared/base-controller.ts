import type { Response } from 'express';
import { sendSuccess, sendNoContent, type ApiWarning } from './response';

export abstract class BaseController {
  protected ok<T>(res: Response, data: T, warnings?: ApiWarning[]): void {
    sendSuccess(res, data, 200, warnings);
  }

  protected created<T>(res: Response, data: T, warnings?: ApiWarning[]): void {
    sendSuccess(res, data, 201, warnings);
  }

  protected noContent(res: Response): void {
    sendNoContent(res);
  }
}
