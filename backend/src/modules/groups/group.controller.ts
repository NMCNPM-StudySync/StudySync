import type { NextFunction, Request, Response } from 'express';
import { getAuthUserId } from '../../middlewares/require-user';
import { BaseController } from '../../shared/base-controller';
import { ValidationError } from '../../shared/errors';
import { GroupService } from './group.service';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function requireGroupId(req: Request): string {
  const groupId = req.params.groupId;
  if (typeof groupId !== 'string' || !UUID_REGEX.test(groupId)) {
    throw new ValidationError('Mã nhóm không đúng định dạng UUID', [
      { field: 'groupId', issue: 'phải là UUID hợp lệ' },
    ]);
  }
  return groupId;
}

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

  public detail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const groupId = requireGroupId(req);
      this.ok(res, await this.service.getDetail(getAuthUserId(req), groupId));
    } catch (err) {
      next(err);
    }
  };

  public inviteLink = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const groupId = requireGroupId(req);
      const { link, created } = await this.service.getInviteLink(getAuthUserId(req), groupId);
      if (created) this.created(res, link);
      else this.ok(res, link);
    } catch (err) {
      next(err);
    }
  };

  public regenerateInviteLink = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const groupId = requireGroupId(req);
      this.created(res, await this.service.regenerateInviteLink(getAuthUserId(req), groupId));
    } catch (err) {
      next(err);
    }
  };
}
