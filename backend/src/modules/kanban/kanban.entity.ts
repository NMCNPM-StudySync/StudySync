import { BaseEntity } from '../../shared/base-entity';
import type { KanbanCardResponse, KanbanCardStatus } from './kanban.dto';

export interface KanbanCardEntityParams {
  id: string;
  groupId: string;
  title: string;
  status: KanbanCardStatus;
  dueAt: Date;
  createdByUserId: string;
  createdByDisplayName?: string | null;
  assignedToUserId?: string | null;
  assignedToDisplayName?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class KanbanCardEntity extends BaseEntity {
  public readonly groupId: string;
  public readonly title: string;
  public readonly status: KanbanCardStatus;
  public readonly dueAt: Date;
  public readonly createdByUserId: string;
  public readonly createdByDisplayName: string | null;
  public readonly assignedToUserId: string | null;
  public readonly assignedToDisplayName: string | null;

  constructor(params: KanbanCardEntityParams) {
    super({
      id: params.id,
      createdAt: params.createdAt,
      updatedAt: params.updatedAt,
    });
    this.groupId = params.groupId;
    this.title = params.title;
    this.status = params.status;
    this.dueAt = params.dueAt;
    this.createdByUserId = params.createdByUserId;
    this.createdByDisplayName = params.createdByDisplayName ?? null;
    this.assignedToUserId = params.assignedToUserId ?? null;
    this.assignedToDisplayName = params.assignedToDisplayName ?? null;
  }

  /**
   * Kiểm tra xem hạn chót của thẻ đã qua thời điểm so sánh (mặc định là hiện tại) hay chưa theo BR-04.
   */
  public isPastDue(now: Date = new Date()): boolean {
    return this.dueAt.getTime() < now.getTime();
  }

  public toResponse(): KanbanCardResponse {
    return {
      id: this.id,
      groupId: this.groupId,
      title: this.title,
      status: this.status,
      dueAt: this.dueAt.toISOString(),
      createdByUserId: this.createdByUserId,
      createdByDisplayName: this.createdByDisplayName,
      assignedToUserId: this.assignedToUserId,
      assignedToDisplayName: this.assignedToDisplayName,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
