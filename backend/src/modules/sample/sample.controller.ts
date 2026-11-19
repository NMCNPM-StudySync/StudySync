import type { NextFunction, Request, Response } from 'express';
import { BaseController } from '../../shared/base-controller';
import { ValidationError } from '../../shared/errors';
import { SampleService } from './sample.service';

export class SampleController extends BaseController {
  constructor(private readonly service: SampleService = new SampleService()) {
    super();
  }

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const result = await this.service.getById(id);
      this.ok(res, result);
    } catch (err) {
      next(err);
    }
  };

  public listAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const results = await this.service.listAll();
      this.ok(res, results);
    } catch (err) {
      next(err);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body;
      if (typeof body !== 'object' || body === null) {
        throw new ValidationError('Dữ liệu yêu cầu phải là một đối tượng JSON');
      }

      const { title, description, withWarning } = body;

      if (typeof title !== 'string') {
        throw new ValidationError('Tiêu đề phải là chuỗi ký tự', [
          { field: 'title', issue: 'phải là chuỗi ký tự' },
        ]);
      }

      if (description !== undefined && description !== null && typeof description !== 'string') {
        throw new ValidationError('Mô tả phải là chuỗi ký tự', [
          { field: 'description', issue: 'phải là chuỗi ký tự' },
        ]);
      }

      if (withWarning !== undefined && typeof withWarning !== 'boolean') {
        throw new ValidationError('Cờ withWarning phải là kiểu boolean', [
          { field: 'withWarning', issue: 'phải là boolean' },
        ]);
      }

      const { data, warnings } = await this.service.create({
        title,
        description: description ?? undefined,
        withWarning: Boolean(withWarning),
      });

      this.created(res, data, warnings);
    } catch (err) {
      next(err);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      await this.service.delete(id);
      this.noContent(res);
    } catch (err) {
      next(err);
    }
  };
}
