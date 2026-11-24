import type { NextFunction, Request, Response } from 'express';
import { BaseController } from '../../shared/base-controller';
import { ValidationError } from '../../shared/errors';
import { getUserId } from '../../utils/auth-helper';
import { WeekScheduleService } from './schedule.service';

export class ScheduleController extends BaseController {
  constructor(private readonly service: WeekScheduleService = new WeekScheduleService()) {
    super();
  }

  public getWeek = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getUserId(req);
      const { weekStart } = req.query;

      if (!weekStart || typeof weekStart !== 'string') {
        throw new ValidationError('Thiếu tham số bắt buộc weekStart', [
          { field: 'weekStart', issue: 'bắt buộc' },
        ]);
      }

      const data = await this.service.getWeekSchedule(userId, weekStart);
      this.ok(res, data);
    } catch (err) {
      next(err);
    }
  };
}
