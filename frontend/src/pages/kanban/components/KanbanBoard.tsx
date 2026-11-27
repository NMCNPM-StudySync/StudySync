/**
 * Component Bảng Kanban 3 cột (Board)
 *
 * Tham chiếu Figma Node 16:106 "Bảng Kanban · 3 cột"
 * Issue #142 — Người viết: Kiên (tkien-ngdinh)
 */

import type { KanbanCard, KanbanStatus } from '../../../types/kanban';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  cards: KanbanCard[];
  currentUserId?: string;
  isLeader?: boolean;
  onCardClick: (card: KanbanCard) => void;
  onStatusChange: (cardId: string, newStatus: KanbanStatus) => void;
  onDropCard: (cardId: string, targetStatus: KanbanStatus) => void;
  onOpenCreateModal: () => void;
}

export function KanbanBoard({
  cards,
  currentUserId,
  isLeader,
  onCardClick,
  onStatusChange,
  onDropCard,
  onOpenCreateModal,
}: KanbanBoardProps) {
  // Lọc thẻ vào đúng 3 cột
  const todoCards = cards.filter((c) => c.status === 'todo');
  const inProgressCards = cards.filter((c) => c.status === 'in_progress');
  const doneCards = cards.filter((c) => c.status === 'done');

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6"
      data-testid="kanban-board-3-cols"
    >
      {/* Cột 1: Cần làm (todo) */}
      <KanbanColumn
        status="todo"
        title="Cần làm"
        cards={todoCards}
        currentUserId={currentUserId}
        isLeader={isLeader}
        onCardClick={onCardClick}
        onStatusChange={onStatusChange}
        onDropCard={onDropCard}
        onOpenCreateModal={onOpenCreateModal}
      />

      {/* Cột 2: Đang làm (in_progress) */}
      <KanbanColumn
        status="in_progress"
        title="Đang làm"
        cards={inProgressCards}
        currentUserId={currentUserId}
        isLeader={isLeader}
        onCardClick={onCardClick}
        onStatusChange={onStatusChange}
        onDropCard={onDropCard}
      />

      {/* Cột 3: Đã xong (done) */}
      <KanbanColumn
        status="done"
        title="Đã xong"
        cards={doneCards}
        currentUserId={currentUserId}
        isLeader={isLeader}
        onCardClick={onCardClick}
        onStatusChange={onStatusChange}
        onDropCard={onDropCard}
      />
    </div>
  );
}
