export type KanbanCardStatus = 'todo' | 'in_progress' | 'done';

export const KANBAN_CARD_STATUSES: readonly KanbanCardStatus[] = [
  'todo',
  'in_progress',
  'done',
] as const;

export function isValidKanbanStatus(status: unknown): status is KanbanCardStatus {
  return typeof status === 'string' && KANBAN_CARD_STATUSES.includes(status as KanbanCardStatus);
}

export interface CreateKanbanCardDto {
  title: string;
  dueAt: string;
}

export interface UpdateKanbanCardDto {
  title?: string;
  dueAt?: string;
}

export interface UpdateKanbanCardStatusDto {
  status: KanbanCardStatus;
}

export interface AssignKanbanCardDto {
  assignedToUserId: string | null;
}

export interface KanbanCardResponse {
  id: string;
  groupId: string;
  title: string;
  status: KanbanCardStatus;
  dueAt: string;
  createdByUserId: string;
  createdByDisplayName: string | null;
  assignedToUserId: string | null;
  assignedToDisplayName: string | null;
  createdAt: string;
  updatedAt: string;
}
