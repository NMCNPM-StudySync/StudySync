import type { NextFunction, Request, Response } from 'express';
import { getAuthUserId } from '../../middlewares/authenticate';
import { BaseController } from '../../shared/base-controller';
import { parseReminderQuery } from './meeting.validators';
import type { ReminderService } from './reminder.service';

export class ReminderController extends BaseController {
  constructor(private readonly service: ReminderService) {
    super();
  }

  public listMine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getAuthUserId(req);
      const query = parseReminderQuery(req.query as Record<string, unknown>);
      this.ok(res, await this.service.listMine(userId, query));
    } catch (error) {
      next(error);
    }
  };
}
