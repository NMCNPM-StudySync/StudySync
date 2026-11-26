import type { NextFunction, Request, Response } from 'express';
import { BaseController } from '../../shared/base-controller';
import { ValidationError } from '../../shared/errors';
import { getUserId } from '../../utils/auth-helper';
import { extractUploadedFile } from '../../utils/file-upload';
import { CalendarImportService } from './calendar-import.service';
import { FixedEventService } from './events.service';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class EventController extends BaseController {
  constructor(
    private readonly service: FixedEventService = new FixedEventService(),
    private readonly importService: CalendarImportService = new CalendarImportService(),
  ) {
    super();
  }

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getUserId(req);
      const { from, to } = req.query;

      if (!from || typeof from !== 'string') {
        throw new ValidationError('Thiếu tham số bắt buộc from', [
          { field: 'from', issue: 'bắt buộc' },
        ]);
      }
      if (!to || typeof to !== 'string') {
        throw new ValidationError('Thiếu tham số bắt buộc to', [
          { field: 'to', issue: 'bắt buộc' },
        ]);
      }

      const events = await this.service.listEvents(userId, from, to);
      this.ok(res, { events: events.map((e) => e.toResponseDto()) });
    } catch (err) {
      next(err);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getUserId(req);
      const eventId = req.params.eventId as string;

      if (!UUID_REGEX.test(eventId)) {
        throw new ValidationError('Mã sự kiện eventId không phải định dạng UUID hợp lệ', [
          { field: 'eventId', issue: 'phải là UUID' },
        ]);
      }

      const event = await this.service.getEvent(userId, eventId);
      this.ok(res, event.toResponseDto());
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

      const { title, kind, startsAt, endsAt, location, notes } = body;

      if (!title || typeof title !== 'string') {
        throw new ValidationError('Tiêu đề sự kiện là bắt buộc', [
          { field: 'title', issue: 'bắt buộc' },
        ]);
      }
      if (!startsAt) {
        throw new ValidationError('Thời gian bắt đầu startsAt là bắt buộc', [
          { field: 'startsAt', issue: 'bắt buộc' },
        ]);
      }
      if (!endsAt) {
        throw new ValidationError('Thời gian kết thúc endsAt là bắt buộc', [
          { field: 'endsAt', issue: 'bắt buộc' },
        ]);
      }

      const { data, warnings } = await this.service.createEvent(userId, {
        title,
        kind,
        startsAt,
        endsAt,
        location,
        notes,
      });

      this.created(res, data.toResponseDto(), warnings);
    } catch (err) {
      next(err);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getUserId(req);
      const eventId = req.params.eventId as string;

      if (!UUID_REGEX.test(eventId)) {
        throw new ValidationError('Mã sự kiện eventId không phải định dạng UUID hợp lệ', [
          { field: 'eventId', issue: 'phải là UUID' },
        ]);
      }

      const body = req.body;
      if (typeof body !== 'object' || body === null) {
        throw new ValidationError('Dữ liệu yêu cầu phải là một đối tượng JSON');
      }

      const { data, warnings } = await this.service.updateEvent(userId, eventId, body);
      this.ok(res, data.toResponseDto(), warnings);
    } catch (err) {
      next(err);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getUserId(req);
      const eventId = req.params.eventId as string;

      if (!UUID_REGEX.test(eventId)) {
        throw new ValidationError('Mã sự kiện eventId không phải định dạng UUID hợp lệ', [
          { field: 'eventId', issue: 'phải là UUID' },
        ]);
      }

      const scope = req.query.scope as string | undefined;
      if (scope !== undefined && scope !== 'single' && scope !== 'all') {
        throw new ValidationError("Tham số scope chỉ chấp nhận 'single' hoặc 'all'", [
          { field: 'scope', issue: "phải là 'single' hoặc 'all'" },
        ]);
      }

      await this.service.deleteEvent(userId, eventId, (scope as 'single' | 'all') ?? 'single');
      this.noContent(res);
    } catch (err) {
      next(err);
    }
  };

  public importIcs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getUserId(req);
      const file = extractUploadedFile(req, 'ics');
      const result = await this.importService.importIcs(userId, file.buffer, file.fileName);
      this.ok(res, result.data, result.warnings);
    } catch (err) {
      next(err);
    }
  };

  public importCsv = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getUserId(req);
      const file = extractUploadedFile(req, 'csv');
      const result = await this.importService.importCsv(userId, file.buffer, file.fileName);
      this.ok(res, result.data, result.warnings);
    } catch (err) {
      next(err);
    }
  };
}
