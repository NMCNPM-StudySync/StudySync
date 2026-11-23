import type { NextFunction, Request, Response } from 'express';
import { getAuthUserId } from '../../middlewares/authenticate';
import { BaseController } from '../../shared/base-controller';
import { StatsService } from './stats.service';

export class StatsController extends BaseController {
  constructor(private readonly service: StatsService = new StatsService()) {
    super();
  }

  public getWeeklyStats = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = getAuthUserId(req);
      const fromQuery = typeof req.query.from === 'string' ? req.query.from : undefined;
      const toQuery = typeof req.query.to === 'string' ? req.query.to : undefined;

      const stats = await this.service.getWeeklyStats(userId, fromQuery, toQuery);
      this.ok(res, stats);
    } catch (err) {
      next(err);
    }
  };
}
