import type { NextFunction, Request, Response } from 'express';
import { BaseController } from '../../shared/base-controller';
import { ValidationError } from '../../shared/errors';
import { getUserId } from '../../utils/auth-helper';
import { TaskService } from './tasks.service';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class TaskController extends BaseController {
  constructor(private readonly service: TaskService = new TaskService()) {
    super();
  }

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getUserId(req);
      const { isDone, sortBy, order } = req.query;

      let isDoneBool: boolean | undefined;
      if (isDone !== undefined) {
        if (isDone === 'true') isDoneBool = true;
        else if (isDone === 'false') isDoneBool = false;
        else {
          throw new ValidationError("Tham số isDone chỉ chấp nhận 'true' hoặc 'false'", [
            { field: 'isDone', issue: "phải là 'true' hoặc 'false'" },
          ]);
        }
      }

      const tasks = await this.service.listTasks(userId, {
        isDone: isDoneBool,
        sortBy: sortBy as string | undefined,
        order: order as 'asc' | 'desc' | undefined,
      });

      this.ok(res, { tasks: tasks.map((t) => t.toResponseDto()) });
    } catch (err) {
      next(err);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getUserId(req);
      const taskId = req.params.taskId as string;

      if (!UUID_REGEX.test(taskId)) {
        throw new ValidationError('Mã việc cần làm taskId không phải định dạng UUID hợp lệ', [
          { field: 'taskId', issue: 'phải là UUID' },
        ]);
      }

      const task = await this.service.getTask(userId, taskId);
      this.ok(res, task.toResponseDto());
    } catch (err) {
      next(err);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getUserId(req);
      const body = req.body;

      if (typeof body !== 'object' || body === null) {
        throw new ValidationError('Dữ liệu yêu cầu phải là một đối tượng JSON');
      }

      const { title, dueAt, priority, difficulty, durationMinutes } = body;

      if (!title || typeof title !== 'string') {
        throw new ValidationError('Tiêu đề việc cần làm là bắt buộc', [
          { field: 'title', issue: 'bắt buộc' },
        ]);
      }
      if (!dueAt) {
        throw new ValidationError('Hạn chót dueAt là bắt buộc', [
          { field: 'dueAt', issue: 'bắt buộc' },
        ]);
      }

      const { data, warnings } = await this.service.createTask(userId, {
        title,
        dueAt,
        priority,
        difficulty,
        durationMinutes,
      });

      this.created(res, data.toResponseDto(), warnings);
    } catch (err) {
      next(err);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getUserId(req);
      const taskId = req.params.taskId as string;

      if (!UUID_REGEX.test(taskId)) {
        throw new ValidationError('Mã việc cần làm taskId không phải định dạng UUID hợp lệ', [
          { field: 'taskId', issue: 'phải là UUID' },
        ]);
      }

      const body = req.body;
      if (typeof body !== 'object' || body === null) {
        throw new ValidationError('Dữ liệu yêu cầu phải là một đối tượng JSON');
      }

      const { data, warnings } = await this.service.updateTask(userId, taskId, body);
      this.ok(res, data.toResponseDto(), warnings);
    } catch (err) {
      next(err);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getUserId(req);
      const taskId = req.params.taskId as string;

      if (!UUID_REGEX.test(taskId)) {
        throw new ValidationError('Mã việc cần làm taskId không phải định dạng UUID hợp lệ', [
          { field: 'taskId', issue: 'phải là UUID' },
        ]);
      }

      await this.service.deleteTask(userId, taskId);
      this.noContent(res);
    } catch (err) {
      next(err);
    }
  };
}
