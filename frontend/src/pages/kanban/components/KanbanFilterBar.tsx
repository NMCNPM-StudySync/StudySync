/**
 * Thanh lọc thẻ Kanban
 *
 * Tham chiếu Figma Node 16:2 và Use Case U044 (Lọc thẻ Kanban)
 * Issue #142 — Người viết: Kiên (tkien-ngdinh)
 */

import type { GroupMemberSummary, KanbanFilterType } from '../../../types/kanban';

interface KanbanFilterBarProps {
  currentFilter: KanbanFilterType;
  onFilterChange: (filter: KanbanFilterType) => void;
  selectedAssigneeId?: string;
  onAssigneeFilterChange: (assigneeId: string) => void;
  totalCards: number;
  myCardsCount: number;
  overdueCount: number;
  members: GroupMemberSummary[];
}

export function KanbanFilterBar({
  currentFilter,
  onFilterChange,
  selectedAssigneeId = '',
  onAssigneeFilterChange,
  totalCards,
  myCardsCount,
  overdueCount,
  members,
}: KanbanFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-1">
      {/* Cụm viên pill lọc nhanh */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center rounded-lg border border-brand-borderDefault bg-[#DCE8FA] p-1 shadow-inner">
          <button
            type="button"
            onClick={() => onFilterChange('all')}
            className={`cursor-pointer rounded-md px-3 py-1 text-xs font-semibold transition-all ${
              currentFilter === 'all' && !selectedAssigneeId
                ? 'bg-white text-brand-navy shadow-sm'
                : 'text-brand-slate hover:text-brand-navy'
            }`}
          >
            Tất cả · {totalCards}
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('my_cards')}
            className={`cursor-pointer rounded-md px-3 py-1 text-xs font-semibold transition-all ${
              currentFilter === 'my_cards'
                ? 'bg-white text-brand-navy shadow-sm'
                : 'text-brand-slate hover:text-brand-navy'
            }`}
          >
            Của tôi · {myCardsCount}
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('overdue')}
            className={`cursor-pointer rounded-md px-3 py-1 text-xs font-semibold transition-all ${
              currentFilter === 'overdue'
                ? 'bg-white text-brand-alertText shadow-sm'
                : 'text-brand-slate hover:text-brand-navy'
            }`}
          >
            Quá hạn · {overdueCount}
          </button>
        </div>

        {/* Dropdown lọc theo thành viên phụ trách (U044) */}
        <div className="relative">
          <select
            value={selectedAssigneeId}
            onChange={(e) => onAssigneeFilterChange(e.target.value)}
            className="cursor-pointer appearance-none rounded-lg border border-brand-borderDefault bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-brand-slate shadow-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
            aria-label="Lọc theo người phụ trách"
          >
            <option value="">Thành viên: Tất cả</option>
            <option value="unassigned">Chưa giao cho ai</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.displayName} {m.role === 'leader' ? '(Trưởng nhóm)' : ''}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-brand-muted">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Thông tin sắp xếp */}
      <div className="text-xs text-brand-muted">
        <span>Sắp xếp: </span>
        <span className="font-semibold text-brand-slate">Hạn chót tăng dần (mặc định)</span>
      </div>
    </div>
  );
}
