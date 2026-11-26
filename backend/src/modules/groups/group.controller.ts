import type { NextFunction, Request, Response } from 'express';
import { getAuthUserId } from '../../middlewares/require-user';
import { BaseController } from '../../shared/base-controller';
import { ValidationError } from '../../shared/errors';
import { GroupService } from './group.service';

export class GroupController extends BaseController {
  constructor(private readonly service: GroupService = new GroupService()) {
    super();
  }

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body;
      if (typeof body !== 'object' || body === null || Array.isArray(body)) {
        throw new ValidationError('Dữ liệu yêu cầu phải là một đối tượng JSON');
      }
      this.created(res, await this.service.create(getAuthUserId(req), body.name));
    } catch (err) {
      next(err);
    }
  };

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      this.ok(res, await this.service.listMine(getAuthUserId(req)));
    } catch (err) {
      next(err);
    }
  };
}
