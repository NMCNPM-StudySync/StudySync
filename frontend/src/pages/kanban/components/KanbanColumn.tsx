/**
 * Component Cột Kanban (Column)
 *
 * Tham chiếu Figma Node 16:107 và Yêu cầu 5.2 / Mục 6.2.5 M3
 * Cố định đúng 3 cột: todo ("Cần làm"), in_progress ("Đang làm"), done ("Đã xong")
 * Issue #142 — Người viết: Kiên (tkien-ngdinh)
 */

import { useState } from 'react';
import type { KanbanCard, KanbanStatus } from '../../../types/kanban';
import { KanbanCardItem } from './KanbanCardItem';

interface KanbanColumnProps {
  status: KanbanStatus;
  title: string;
  cards: KanbanCard[];
  currentUserId?: string;
  onCardClick: (card: KanbanCard) => void;
  onStatusChange: (cardId: string, newStatus: KanbanStatus) => void;
  onDropCard: (cardId: string, targetStatus: KanbanStatus) => void;
  onOpenCreateModal?: () => void;
}

export function KanbanColumn({
  status,
  title,
  cards,
  currentUserId,
  onCardClick,
  onStatusChange,
  onDropCard,
  onOpenCreateModal,
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const cardId = e.dataTransfer.getData('text/plain');
        if (cardId) {
          Promise.resolve(onDropCard(cardId, status)).catch(() => {});
        }
      }}
      className={`flex flex-col gap-3 rounded-[14px] border p-3.5 min-h-[500px] transition-colors ${
        isDragOver
          ? 'border-brand-primary bg-brand-surface/70 ring-2 ring-brand-primary/30'
          : 'border-brand-borderDefault bg-brand-surface/30'
      }`}
      data-testid={`kanban-column-${status}`}
    >
      {/* Tiêu đề cột & Đếm số thẻ */}
      <div className="flex items-center justify-between pb-2 border-b border-brand-borderDefault/60">
        <div className="flex items-center gap-2">
          <h2 className="font-heading font-semibold text-sm text-brand-navy">{title}</h2>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-brand-slate shadow-sm">
            {cards.length}
          </span>
        </div>

        {/* Nút thêm nhanh ở cột "Cần làm" (Figma Node 16:115) */}
        {status === 'todo' && onOpenCreateModal && (
          <button
            type="button"
            title="Thêm thẻ mới"
            aria-label="Thêm thẻ mới vào cột Cần làm"
            onClick={onOpenCreateModal}
            className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-brand-primary shadow-sm hover:bg-brand-primary hover:text-white transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Danh sách các thẻ (Sắp xếp theo dueAt ASC, createdAt ASC, id ASC) */}
      <div className="flex flex-col gap-2.5 flex-1">
        {cards.length > 0 ? (
          cards.map((card) => (
            <KanbanCardItem
              key={card.id}
              card={card}
              currentUserId={currentUserId}
              onCardClick={onCardClick}
              onStatusChange={onStatusChange}
            />
          ))
        ) : (
          /* Trạng thái rỗng (Empty State theo Mục 6.3.1 M3) */
          <div
            onClick={status === 'todo' ? onOpenCreateModal : undefined}
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand-borderDefault p-6 text-center text-xs text-brand-muted h-36 select-none ${
              status === 'todo' && onOpenCreateModal
                ? 'cursor-pointer hover:border-brand-primary hover:text-brand-primary hover:bg-white/40'
                : ''
            }`}
          >
            {status === 'todo' ? (
              <>
                <svg
                  className="w-6 h-6 mb-1 text-brand-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span className="font-medium">Nhấp để tạo thẻ công việc đầu tiên cho nhóm</span>
              </>
            ) : status === 'in_progress' ? (
              <span>Chưa có việc nào đang thực hiện</span>
            ) : (
              <span>Chưa có việc nào hoàn thành</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
