import type { NextFunction, Request, Response } from 'express';
import { getAuthUserId } from '../../middlewares/require-user';
import { BaseController } from '../../shared/base-controller';
import { ValidationError } from '../../shared/errors';
import { AuthService } from './auth.service';

function bodyOf(req: Request): Record<string, unknown> {
  const body = req.body;
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new ValidationError('Dữ liệu yêu cầu phải là một đối tượng JSON');
  }
  return body as Record<string, unknown>;
}

export class AuthController extends BaseController {
  constructor(private readonly service: AuthService = new AuthService()) {
    super();
  }

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { displayName, email, password } = bodyOf(req);
      this.created(res, await this.service.register({ displayName, email, password }));
    } catch (err) {
      next(err);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = bodyOf(req);
      this.ok(res, await this.service.login({ email, password }));
    } catch (err) {
      next(err);
    }
  };

  public me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      this.ok(res, await this.service.getMe(getAuthUserId(req)));
    } catch (err) {
      next(err);
    }
  };
}
