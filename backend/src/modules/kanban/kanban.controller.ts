import type { NextFunction, Request, Response } from 'express';
import { getAuthUserId } from '../../middlewares/require-user';
import { BaseController } from '../../shared/base-controller';
import { ValidationError } from '../../shared/errors';
import type { KanbanCardStatus } from './kanban.dto';
import { isValidKanbanStatus } from './kanban.dto';
import { KanbanService } from './kanban.service';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(id: unknown): id is string {
  return typeof id === 'string' && UUID_REGEX.test(id);
}

export class KanbanController extends BaseController {
  constructor(private readonly service: KanbanService = new KanbanService()) {
    super();
  }

  public getCards = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getAuthUserId(req);
      const groupId = req.params.groupId;

      if (!isValidUuid(groupId)) {
        throw new ValidationError('Mã nhóm không đúng định dạng UUID', [
          { field: 'groupId', issue: 'phải là UUID hợp lệ' },
        ]);
      }

      const assigneeQuery = req.query.assigneeId;
      let assigneeFilter: string | undefined;

      if (assigneeQuery !== undefined) {
        if (typeof assigneeQuery !== 'string' || assigneeQuery.trim().length === 0) {
          throw new ValidationError('Tham số assigneeId không được để trống khi truyền vào', [
            { field: 'assigneeId', issue: 'không được để trống' },
          ]);
        }

        const trimmed = assigneeQuery.trim();
        if (trimmed === 'unassigned') {
          assigneeFilter = 'unassigned';
        } else if (isValidUuid(trimmed)) {
          assigneeFilter = trimmed;
        } else {
          throw new ValidationError(
            'Tham số assigneeId phải là UUID hợp lệ hoặc chuỗi "unassigned"',
            [{ field: 'assigneeId', issue: 'phải là UUID hoặc "unassigned"' }],
          );
        }
      }

      const cards = await this.service.getCards(userId, groupId, assigneeFilter);
      this.ok(res, { cards: cards.map((c) => c.toResponse()) });
    } catch (err) {
      next(err);
    }
  };

  public createCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getAuthUserId(req);
      const groupId = req.params.groupId;

      if (!isValidUuid(groupId)) {
        throw new ValidationError('Mã nhóm không đúng định dạng UUID', [
          { field: 'groupId', issue: 'phải là UUID hợp lệ' },
        ]);
      }

      const body = req.body as Record<string, unknown>;
      if (typeof body !== 'object' || body === null) {
        throw new ValidationError('Dữ liệu yêu cầu phải là một đối tượng JSON');
      }

      // TC-123: Từ chối các trường ngoài phạm vi
      if ('durationMinutes' in body) {
        throw new ValidationError(
          'Thẻ Kanban không có trường thời lượng ước tính durationMinutes',
          [{ field: 'durationMinutes', issue: 'trường không được hỗ trợ' }],
        );
      }
      if ('status' in body) {
        throw new ValidationError('Không được truyền trạng thái cột khi tạo thẻ mới', [
          { field: 'status', issue: 'trường không được hỗ trợ khi tạo mới' },
        ]);
      }
      if ('assignedToUserId' in body) {
        throw new ValidationError('Không được giao thẻ trực tiếp khi tạo mới', [
          { field: 'assignedToUserId', issue: 'trường không được hỗ trợ khi tạo mới' },
        ]);
      }

      const { title, dueAt } = body;

      if (title === undefined) {
        throw new ValidationError('Tên thẻ không được để trống', [
          { field: 'title', issue: 'bắt buộc' },
        ]);
      }
      if (dueAt === undefined) {
        throw new ValidationError('Hạn chót không được để trống', [
          { field: 'dueAt', issue: 'bắt buộc' },
        ]);
      }

      const { card, warnings } = await this.service.createCard(userId, groupId, {
        title: String(title),
        dueAt: String(dueAt),
      });

      this.created(res, card.toResponse(), warnings);
    } catch (err) {
      next(err);
    }
  };

  public updateCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getAuthUserId(req);
      const { groupId, cardId } = req.params;

      if (!isValidUuid(groupId)) {
        throw new ValidationError('Mã nhóm không đúng định dạng UUID', [
          { field: 'groupId', issue: 'phải là UUID hợp lệ' },
        ]);
      }
      if (!isValidUuid(cardId)) {
        throw new ValidationError('Mã thẻ không đúng định dạng UUID', [
          { field: 'cardId', issue: 'phải là UUID hợp lệ' },
        ]);
      }

      const body = req.body as Record<string, unknown>;
      if (typeof body !== 'object' || body === null) {
        throw new ValidationError('Dữ liệu yêu cầu phải là một đối tượng JSON');
      }

      // Chặn các trường ngoài phạm vi
      if ('status' in body) {
        throw new ValidationError(
          'Không thể cập nhật status tại endpoint này, hãy dùng PATCH /status',
          [{ field: 'status', issue: 'dùng PATCH /status để chuyển cột' }],
        );
      }
      if ('assignedToUserId' in body) {
        throw new ValidationError('Không thể giao thẻ tại endpoint này, hãy dùng PATCH /assignee', [
          { field: 'assignedToUserId', issue: 'dùng PATCH /assignee để giao thẻ' },
        ]);
      }
      if ('durationMinutes' in body) {
        throw new ValidationError(
          'Thẻ Kanban không có trường thời lượng ước tính durationMinutes',
          [{ field: 'durationMinutes', issue: 'trường không được hỗ trợ' }],
        );
      }

      // TC-119: Không được xóa hạn chót bằng null
      if (body.dueAt === null) {
        throw new ValidationError('Hạn chót không được để trống', [
          { field: 'dueAt', issue: 'không được null' },
        ]);
      }

      const { title, dueAt } = body;
      if (title === undefined && dueAt === undefined) {
        throw new ValidationError('Dữ liệu cập nhật không được để trống');
      }

      const { card, warnings } = await this.service.updateCard(userId, groupId, cardId, {
        title: title !== undefined ? String(title) : undefined,
        dueAt: dueAt !== undefined ? String(dueAt) : undefined,
      });

      this.ok(res, card.toResponse(), warnings);
    } catch (err) {
      next(err);
    }
  };

  public deleteCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getAuthUserId(req);
      const { groupId, cardId } = req.params;

      if (!isValidUuid(groupId)) {
        throw new ValidationError('Mã nhóm không đúng định dạng UUID', [
          { field: 'groupId', issue: 'phải là UUID hợp lệ' },
        ]);
      }
      if (!isValidUuid(cardId)) {
        throw new ValidationError('Mã thẻ không đúng định dạng UUID', [
          { field: 'cardId', issue: 'phải là UUID hợp lệ' },
        ]);
      }

      await this.service.deleteCard(userId, groupId, cardId);
      this.noContent(res);
    } catch (err) {
      next(err);
    }
  };

  public updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getAuthUserId(req);
      const { groupId, cardId } = req.params;

      if (!isValidUuid(groupId)) {
        throw new ValidationError('Mã nhóm không đúng định dạng UUID', [
          { field: 'groupId', issue: 'phải là UUID hợp lệ' },
        ]);
      }
      if (!isValidUuid(cardId)) {
        throw new ValidationError('Mã thẻ không đúng định dạng UUID', [
          { field: 'cardId', issue: 'phải là UUID hợp lệ' },
        ]);
      }

      const body = req.body as Record<string, unknown>;
      if (typeof body !== 'object' || body === null || !('status' in body)) {
        throw new ValidationError('Yêu cầu phải có trường status', [
          { field: 'status', issue: 'bắt buộc' },
        ]);
      }

      const status = body.status as KanbanCardStatus;
      if (!isValidKanbanStatus(status)) {
        throw new ValidationError(
          `Trạng thái status phải là một trong: 'todo', 'in_progress', 'done'`,
          [{ field: 'status', issue: 'không hợp lệ' }],
        );
      }

      const updated = await this.service.updateStatus(userId, groupId, cardId, status);
      this.ok(res, updated.toResponse());
    } catch (err) {
      next(err);
    }
  };

  public assignCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getAuthUserId(req);
      const { groupId, cardId } = req.params;

      if (!isValidUuid(groupId)) {
        throw new ValidationError('Mã nhóm không đúng định dạng UUID', [
          { field: 'groupId', issue: 'phải là UUID hợp lệ' },
        ]);
      }
      if (!isValidUuid(cardId)) {
        throw new ValidationError('Mã thẻ không đúng định dạng UUID', [
          { field: 'cardId', issue: 'phải là UUID hợp lệ' },
        ]);
      }

      const body = req.body as Record<string, unknown>;
      if (typeof body !== 'object' || body === null || !('assignedToUserId' in body)) {
        throw new ValidationError('Yêu cầu phải có trường assignedToUserId', [
          { field: 'assignedToUserId', issue: 'bắt buộc' },
        ]);
      }

      const assignedToUserId = body.assignedToUserId;
      if (assignedToUserId !== null && !isValidUuid(assignedToUserId)) {
        throw new ValidationError(
          'Mã người được giao assignedToUserId phải là UUID hợp lệ hoặc null',
          [{ field: 'assignedToUserId', issue: 'phải là UUID hoặc null' }],
        );
      }

      const updated = await this.service.assignCard(
        userId,
        groupId,
        cardId,
        assignedToUserId as string | null,
      );
      this.ok(res, updated.toResponse());
    } catch (err) {
      next(err);
    }
  };
}
