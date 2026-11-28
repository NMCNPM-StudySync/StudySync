/**
 * Component Thẻ Kanban (Card Item)
 *
 * Tham chiếu Figma Node 16:119 và 16:170
 * Issue #142 — Người viết: Kiên (tkien-ngdinh)
 */

import { useState } from 'react';
import type { KanbanCard, KanbanStatus } from '../../../types/kanban';
import { formatVietnamDateTime } from '../../../utils/vietnam-time';

interface KanbanCardItemProps {
  card: KanbanCard;
  currentUserId?: string;
  onCardClick: (card: KanbanCard) => void;
  onStatusChange: (cardId: string, newStatus: KanbanStatus) => void;
  onDragStart?: (card: KanbanCard) => void;
  onDragEnd?: () => void;
}

function getInitials(name: string | null): string {
  if (!name || name.trim().length === 0) return '??';
  const parts = name.trim().split(/\s+/);
  const first = parts[0] ?? '';
  const last = parts[parts.length - 1] ?? '';
  if (parts.length === 1) return first.substring(0, 2).toUpperCase();
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}

export function KanbanCardItem({
  card,
  currentUserId,
  onCardClick,
  onStatusChange,
  onDragStart,
  onDragEnd,
}: KanbanCardItemProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTime] = useState(() => Date.now());
  const isOverdue = card.status !== 'done' && new Date(card.dueAt).getTime() < currentTime;
  const isAssignedToMe = currentUserId && card.assignedToUserId === currentUserId;

  const nextStatuses: Array<{ status: KanbanStatus; label: string }> = [
    { status: 'todo', label: 'Cần làm' },
    { status: 'in_progress', label: 'Đang làm' },
    { status: 'done', label: 'Đã xong' },
  ].filter((s) => s.status !== card.status) as Array<{ status: KanbanStatus; label: string }>;

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', card.id);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart?.(card);
      }}
      onDragEnd={() => onDragEnd?.()}
      onClick={() => onCardClick(card)}
      className="group relative flex flex-col gap-2 rounded-[11px] border border-brand-borderDefault bg-white p-3 shadow-sm hover:shadow-md hover:border-brand-primary/50 transition-all cursor-pointer active:cursor-grabbing"
      data-testid={`kanban-card-${card.id}`}
    >
      {/* Tiêu đề thẻ (BR-08: tối đa 200 ký tự) */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-heading font-semibold text-sm leading-snug text-brand-navy break-words flex-1">
          {card.title}
        </h3>

        {/* Nút thao tác nhanh (Chuyển cột trên mobile / menu) */}
        <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            title="Thao tác nhanh"
            aria-label={`Thao tác thẻ ${card.title}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 rounded text-brand-muted hover:text-brand-navy hover:bg-brand-surface/50 opacity-80 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 z-20 w-36 rounded-lg border border-brand-borderDefault bg-white py-1 shadow-lg text-xs">
              <div className="px-3 py-1 font-semibold text-brand-muted uppercase text-[10px] tracking-wider">
                Chuyển sang:
              </div>
              {nextStatuses.map(({ status, label }) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    Promise.resolve(onStatusChange(card.id, status)).catch(() => {});
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-brand-surface hover:text-brand-primary font-medium"
                >
                  ➜ {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Thông tin hạn chót (BR-04, BR-07) */}
      <div className="flex items-center gap-1.5 text-xs">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium text-[11px] ${
            isOverdue
              ? 'bg-brand-alert text-brand-alertText border border-brand-alertText/20'
              : 'text-brand-muted bg-brand-surface/60'
          }`}
          title={isOverdue ? 'Hạn chót đã qua thời điểm hiện tại' : undefined}
        >
          {isOverdue && <span aria-hidden="true">⚠</span>}
          <span>Hạn {formatVietnamDateTime(card.dueAt)}</span>
        </span>
      </div>

      {/* Chân thẻ: Người phụ trách & Người tạo */}
      <div className="flex items-center justify-between pt-1 border-t border-brand-borderDefault/30 text-[11px]">
        {/* Người phụ trách */}
        {card.assignedToDisplayName ? (
          <div
            className="flex items-center gap-1.5"
            title={`Được giao cho: ${card.assignedToDisplayName}`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold border ${
                isAssignedToMe
                  ? 'bg-brand-primary text-white border-brand-primary'
                  : 'bg-brand-surface text-brand-slate border-brand-borderDefault'
              }`}
            >
              {getInitials(card.assignedToDisplayName)}
            </span>
            <span className="text-brand-slate font-medium truncate max-w-[110px]">
              {card.assignedToDisplayName}
            </span>
          </div>
        ) : (
          <span className="text-gray-400 italic text-[11px]">Chưa giao</span>
        )}

        {/* Người tạo */}
        <span
          className="text-[10px] text-brand-muted truncate max-w-[90px]"
          title={`Tạo bởi: ${card.createdByDisplayName || 'Thành viên'}`}
        >
          {card.createdByDisplayName || ''}
        </span>
      </div>
    </div>
  );
}
