/**
 * Types cho Module TV5 — Quản lý thẻ Kanban nhóm
 *
 * Tuân thủ docs/api.md và CSDL bảng kanban_cards (BR-04, BR-07, BR-08)
 * Issue #142 — Người viết: Kiên (tkien-ngdinh)
 */

export type KanbanStatus = 'todo' | 'in_progress' | 'done';

export const KANBAN_STATUSES: readonly KanbanStatus[] = ['todo', 'in_progress', 'done'] as const;

export const KANBAN_STATUS_LABELS: Record<KanbanStatus, string> = {
  todo: 'Cần làm',
  in_progress: 'Đang làm',
  done: 'Đã xong',
};

export interface KanbanCard {
  id: string;
  groupId: string;
  title: string;
  status: KanbanStatus;
  dueAt: string; // ISO 8601 UTC kết thúc bằng Z
  createdByUserId: string;
  createdByDisplayName: string | null;
  assignedToUserId: string | null;
  assignedToDisplayName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCardPayload {
  title: string;
  dueAt: string;
}

export interface UpdateCardPayload {
  title?: string;
  dueAt?: string;
}

export interface UpdateCardStatusPayload {
  status: KanbanStatus;
}

export interface AssignCardPayload {
  assignedToUserId: string | null;
}

export interface GroupMemberSummary {
  userId: string;
  displayName: string;
  role: 'leader' | 'member';
}

export interface GroupDetailResponse {
  id: string;
  name: string;
  role?: 'leader' | 'member';
  members?: GroupMemberSummary[];
}

export type KanbanFilterType = 'all' | 'my_cards' | 'overdue' | 'unassigned' | string;
