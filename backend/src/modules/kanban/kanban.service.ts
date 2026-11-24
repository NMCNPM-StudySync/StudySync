import { randomUUID } from 'node:crypto';
import { pool } from '../../config/db';
import type { Queryable } from '../../shared/base-repository';
import { ForbiddenError, NotFoundError, ValidationError } from '../../shared/errors';
import type { ApiWarning } from '../../shared/response';
import { validateKanbanCardTitle } from '../../utils/validation';
import type { CreateKanbanCardDto, KanbanCardStatus, UpdateKanbanCardDto } from './kanban.dto';
import { isValidKanbanStatus } from './kanban.dto';
import { KanbanCardEntity } from './kanban.entity';
import { KanbanRepository } from './kanban.repository';

const ISO_UTC_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;

export class KanbanService {
  constructor(
    private readonly repo: KanbanRepository = new KanbanRepository(),
    private readonly db: Queryable = pool,
  ) {}

  private validateIsoUtcDate(dateStr: unknown, fieldName: string): Date {
    if (typeof dateStr !== 'string' || !ISO_UTC_REGEX.test(dateStr)) {
      throw new ValidationError(`Hạn chót phải có định dạng ISO 8601 theo UTC hậu tố Z`, [
        { field: fieldName, issue: 'sai định dạng ISO 8601 UTC' },
      ]);
    }

    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) {
      throw new ValidationError(`Thời gian không hợp lệ`, [
        { field: fieldName, issue: 'thời gian không hợp lệ' },
      ]);
    }

    return date;
  }

  public async getCards(
    callerUserId: string,
    groupId: string,
    assigneeFilter?: string,
  ): Promise<KanbanCardEntity[]> {
    const groupExists = await this.repo.groupExists(groupId, this.db);
    if (!groupExists) {
      throw new NotFoundError('Không tìm thấy nhóm');
    }

    const isMember = await this.repo.isGroupMember(callerUserId, groupId, this.db);
    if (!isMember) {
      throw new ForbiddenError('Người gọi không thuộc nhóm');
    }

    return this.repo.findCards(groupId, assigneeFilter, this.db);
  }

  public async createCard(
    callerUserId: string,
    groupId: string,
    dto: CreateKanbanCardDto,
  ): Promise<{ card: KanbanCardEntity; warnings?: ApiWarning[] }> {
    const groupExists = await this.repo.groupExists(groupId, this.db);
    if (!groupExists) {
      throw new NotFoundError('Không tìm thấy nhóm');
    }

    const isMember = await this.repo.isGroupMember(callerUserId, groupId, this.db);
    if (!isMember) {
      throw new ForbiddenError('Người gọi không thuộc nhóm');
    }

    // BR-08: Validate và chuẩn hóa tên thẻ Kanban
    const titleVal = validateKanbanCardTitle(dto.title);
    if (!titleVal.isValid) {
      if (titleVal.error === 'EMPTY_NAME') {
        throw new ValidationError('Tên thẻ không được để trống', [
          { field: 'title', issue: 'không được để trống' },
        ]);
      }
      if (titleVal.error === 'NAME_TOO_LONG') {
        throw new ValidationError('Tên thẻ không được vượt quá 200 ký tự', [
          { field: 'title', issue: 'vượt quá 200 ký tự' },
        ]);
      }
      throw new ValidationError('Tên thẻ phải là chuỗi ký tự', [
        { field: 'title', issue: 'phải là chuỗi ký tự' },
      ]);
    }

    // BR-04 & BR-07: Validate hạn chót
    const dueAtDate = this.validateIsoUtcDate(dto.dueAt, 'dueAt');

    const warnings: ApiWarning[] = [];
    if (dueAtDate.getTime() < Date.now()) {
      warnings.push({
        code: 'DEADLINE_PASSED',
        message: 'Hạn chót đã qua thời điểm hiện tại',
        details: [{ field: 'dueAt', issue: 'đã qua' }],
      });
    }

    const now = new Date();
    const entity = new KanbanCardEntity({
      id: randomUUID(),
      groupId,
      title: titleVal.normalized,
      status: 'todo',
      dueAt: dueAtDate,
      createdByUserId: callerUserId,
      assignedToUserId: null,
      createdAt: now,
      updatedAt: now,
    });

    const saved = await this.repo.createCard(entity, this.db);
    return {
      card: saved,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  public async updateCard(
    callerUserId: string,
    groupId: string,
    cardId: string,
    dto: UpdateKanbanCardDto,
  ): Promise<{ card: KanbanCardEntity; warnings?: ApiWarning[] }> {
    const groupExists = await this.repo.groupExists(groupId, this.db);
    if (!groupExists) {
      throw new NotFoundError('Không tìm thấy nhóm');
    }

    const role = await this.repo.getMemberRole(callerUserId, groupId, this.db);
    if (!role) {
      throw new ForbiddenError('Người gọi không thuộc nhóm');
    }

    const card = await this.repo.findCardById(cardId, groupId, this.db);
    if (!card) {
      throw new NotFoundError('Thẻ không còn tồn tại');
    }

    // Phân quyền sửa thẻ: Người tạo thẻ hoặc Trưởng nhóm
    const isCreator = card.createdByUserId === callerUserId;
    const isLeader = role === 'leader';
    if (!isCreator && !isLeader) {
      throw new ForbiddenError(
        'Chỉ người tạo thẻ hoặc Trưởng nhóm mới có quyền sửa tên và hạn chót thẻ này',
      );
    }

    if (dto.title === undefined && dto.dueAt === undefined) {
      throw new ValidationError('Yêu cầu phải có ít nhất title hoặc dueAt để cập nhật');
    }

    let finalTitle = card.title;
    if (dto.title !== undefined) {
      const titleVal = validateKanbanCardTitle(dto.title);
      if (!titleVal.isValid) {
        if (titleVal.error === 'EMPTY_NAME') {
          throw new ValidationError('Tên thẻ không được để trống', [
            { field: 'title', issue: 'không được để trống' },
          ]);
        }
        if (titleVal.error === 'NAME_TOO_LONG') {
          throw new ValidationError('Tên thẻ không được vượt quá 200 ký tự', [
            { field: 'title', issue: 'vượt quá 200 ký tự' },
          ]);
        }
        throw new ValidationError('Tên thẻ phải là chuỗi ký tự', [
          { field: 'title', issue: 'phải là chuỗi ký tự' },
        ]);
      }
      finalTitle = titleVal.normalized;
    }

    let finalDueAt = card.dueAt;
    if (dto.dueAt !== undefined) {
      if (dto.dueAt === null) {
        throw new ValidationError('Hạn chót không được để trống', [
          { field: 'dueAt', issue: 'không được để trống' },
        ]);
      }
      finalDueAt = this.validateIsoUtcDate(dto.dueAt, 'dueAt');
    }

    const warnings: ApiWarning[] = [];
    if (finalDueAt.getTime() < Date.now()) {
      warnings.push({
        code: 'DEADLINE_PASSED',
        message: 'Hạn chót đã qua thời điểm hiện tại',
        details: [{ field: 'dueAt', issue: 'đã qua' }],
      });
    }

    const updated = await this.repo.updateCardDetails(
      cardId,
      groupId,
      finalTitle,
      finalDueAt,
      this.db,
    );
    if (!updated) {
      throw new NotFoundError('Thẻ không còn tồn tại');
    }

    return {
      card: updated,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  public async deleteCard(callerUserId: string, groupId: string, cardId: string): Promise<void> {
    const groupExists = await this.repo.groupExists(groupId, this.db);
    if (!groupExists) {
      throw new NotFoundError('Không tìm thấy nhóm');
    }

    const role = await this.repo.getMemberRole(callerUserId, groupId, this.db);
    if (!role) {
      throw new ForbiddenError('Người gọi không thuộc nhóm');
    }

    const card = await this.repo.findCardById(cardId, groupId, this.db);
    if (!card) {
      throw new NotFoundError('Thẻ không còn tồn tại');
    }

    // Phân quyền xóa thẻ: Người tạo thẻ hoặc Trưởng nhóm
    const isCreator = card.createdByUserId === callerUserId;
    const isLeader = role === 'leader';
    if (!isCreator && !isLeader) {
      throw new ForbiddenError('Chỉ người tạo thẻ hoặc Trưởng nhóm mới có quyền xóa thẻ này');
    }

    const deleted = await this.repo.deleteCard(cardId, groupId, this.db);
    if (!deleted) {
      throw new NotFoundError('Thẻ không còn tồn tại');
    }
  }

  public async updateStatus(
    callerUserId: string,
    groupId: string,
    cardId: string,
    status: KanbanCardStatus,
  ): Promise<KanbanCardEntity> {
    const groupExists = await this.repo.groupExists(groupId, this.db);
    if (!groupExists) {
      throw new NotFoundError('Không tìm thấy nhóm');
    }

    const isMember = await this.repo.isGroupMember(callerUserId, groupId, this.db);
    if (!isMember) {
      throw new ForbiddenError('Người gọi không thuộc nhóm');
    }

    if (!isValidKanbanStatus(status)) {
      throw new ValidationError(
        `Trạng thái cột phải thuộc một trong ba giá trị: 'todo', 'in_progress', 'done'`,
        [{ field: 'status', issue: 'trạng thái cột không hợp lệ' }],
      );
    }

    const card = await this.repo.findCardById(cardId, groupId, this.db);
    if (!card) {
      throw new NotFoundError('Thẻ không còn tồn tại');
    }

    // Idempotent: nếu trạng thái không đổi thì trả về ngay
    if (card.status === status) {
      return card;
    }

    const updated = await this.repo.updateCardStatus(cardId, groupId, status, this.db);
    if (!updated) {
      throw new NotFoundError('Thẻ không còn tồn tại');
    }

    return updated;
  }

  public async assignCard(
    callerUserId: string,
    groupId: string,
    cardId: string,
    assignedToUserId: string | null,
  ): Promise<KanbanCardEntity> {
    const groupExists = await this.repo.groupExists(groupId, this.db);
    if (!groupExists) {
      throw new NotFoundError('Không tìm thấy nhóm');
    }

    const role = await this.repo.getMemberRole(callerUserId, groupId, this.db);
    if (!role) {
      throw new ForbiddenError('Người gọi không thuộc nhóm');
    }

    // Phân quyền giao việc: Độc quyền Trưởng nhóm
    if (role !== 'leader') {
      throw new ForbiddenError('Chỉ Trưởng nhóm mới có quyền giao hoặc bỏ giao thẻ');
    }

    const card = await this.repo.findCardById(cardId, groupId, this.db);
    if (!card) {
      throw new NotFoundError('Thẻ không còn tồn tại');
    }

    // Nếu gán cho người khác (khác null): người đó phải thuộc nhóm
    if (assignedToUserId !== null) {
      const isTargetMember = await this.repo.isGroupMember(assignedToUserId, groupId, this.db);
      if (!isTargetMember) {
        throw new NotFoundError('Thành viên không còn trong nhóm');
      }
    }

    const updated = await this.repo.updateCardAssignee(cardId, groupId, assignedToUserId, this.db);
    if (!updated) {
      throw new NotFoundError('Thẻ không còn tồn tại');
    }

    return updated;
  }
}
