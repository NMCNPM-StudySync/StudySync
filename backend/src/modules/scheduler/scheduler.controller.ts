import type { NextFunction, Request, Response } from 'express';
import { requireUserId } from '../../shared/auth-user';
import { BaseController } from '../../shared/base-controller';
import { ValidationError } from '../../shared/errors';
import { SchedulerService, type ConfirmInput } from './scheduler.service';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Endpoint TV3 trong docs/api.md: auto-plan, confirm, missed-session, completed-session. */
export class SchedulerController extends BaseController {
  constructor(private readonly service: SchedulerService = new SchedulerService()) {
    super();
  }

  public autoPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = requireUserId(req);
      const { data, warnings } = await this.service.autoPlan(userId);
      this.ok(res, data, warnings);
    } catch (err) {
      next(err);
    }
  };

  public confirm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = requireUserId(req);
      const input = readConfirmInput(req.body);
      const { data } = await this.service.confirm(userId, input);
      this.ok(res, data);
    } catch (err) {
      next(err);
    }
  };

  public missedSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = requireUserId(req);
      const slotId = readSlotId(req.body);
      const { data, warnings } = await this.service.reportMissed(userId, slotId);
      this.ok(res, data, warnings);
    } catch (err) {
      next(err);
    }
  };

  public completedSession = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = requireUserId(req);
      const slotId = readSlotId(req.body);
      const { data } = await this.service.markCompleted(userId, slotId);
      this.ok(res, data);
    } catch (err) {
      next(err);
    }
  };
}

/** Đọc body của POST /api/scheduler/confirm: proposalId (uuid), action, slotId (uuid, tùy chọn). */
function readConfirmInput(body: unknown): ConfirmInput {
  const raw = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>;

  const proposalId = raw.proposalId;
  if (proposalId === undefined || proposalId === null || proposalId === '') {
    throw new ValidationError('Thiếu mã lượt đề xuất', [
      { field: 'proposalId', issue: 'bắt buộc' },
    ]);
  }
  if (typeof proposalId !== 'string' || !UUID_PATTERN.test(proposalId)) {
    throw new ValidationError('Mã lượt đề xuất không đúng định dạng UUID', [
      { field: 'proposalId', issue: 'sai định dạng UUID' },
    ]);
  }

  const action = raw.action;
  if (action === undefined || action === null || action === '') {
    throw new ValidationError('Thiếu hành động xác nhận', [{ field: 'action', issue: 'bắt buộc' }]);
  }
  if (action !== 'accept' && action !== 'reject') {
    throw new ValidationError('Hành động chỉ nhận accept hoặc reject', [
      { field: 'action', issue: 'ngoài danh mục' },
    ]);
  }

  const input: ConfirmInput = { proposalId, action };
  if (raw.slotId !== undefined && raw.slotId !== null) {
    input.slotId = readSlotId(raw);
  }
  return input;
}

function readSlotId(body: unknown): string {
  const slotId =
    typeof body === 'object' && body !== null ? (body as { slotId?: unknown }).slotId : undefined;
  if (slotId === undefined || slotId === null || slotId === '') {
    throw new ValidationError('Thiếu mã khung giờ học', [{ field: 'slotId', issue: 'bắt buộc' }]);
  }
  if (typeof slotId !== 'string' || !UUID_PATTERN.test(slotId)) {
    throw new ValidationError('Mã khung giờ học không đúng định dạng UUID', [
      { field: 'slotId', issue: 'sai định dạng UUID' },
    ]);
  }
  return slotId;
}
