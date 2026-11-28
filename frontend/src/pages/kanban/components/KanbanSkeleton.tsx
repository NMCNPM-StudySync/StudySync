/**
 * Skeleton Loader cho Bảng Kanban
 *
 * Tuân thủ Mục 6.3.2 Báo cáo M3 (Loading States)
 * Issue #142 — Người viết: Kiên (tkien-ngdinh)
 */

export function KanbanSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse" data-testid="kanban-skeleton">
      {/* Filter bar skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-2">
        <div className="flex items-center gap-2">
          <div className="h-9 w-20 bg-brand-surface rounded-lg" />
          <div className="h-9 w-20 bg-brand-surface rounded-lg" />
          <div className="h-9 w-24 bg-brand-surface rounded-lg" />
          <div className="h-9 w-36 bg-brand-surface rounded-lg" />
        </div>
        <div className="h-5 w-44 bg-brand-surface rounded" />
      </div>

      {/* 3 Cột Kanban skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {[0, 1, 2].map((colIndex) => (
          <div
            key={colIndex}
            className="flex flex-col gap-3 rounded-[14px] border border-brand-borderDefault/60 bg-[#DCE8F8]/60 p-3 min-h-[420px]"
          >
            {/* Header cột */}
            <div className="flex items-center justify-between pb-2">
              <div className="h-5 w-24 bg-brand-slate/20 rounded" />
              <div className="h-5 w-6 bg-brand-slate/20 rounded-full" />
            </div>

            {/* Các thẻ skeleton */}
            {[0, 1, 2].map((cardIndex) => (
              <div
                key={cardIndex}
                className="flex flex-col gap-2 rounded-[11px] border border-[#C4D4EB] bg-[#F8FBFF] p-3 shadow-sm"
              >
                <div className="h-4 w-3/4 bg-brand-slate/20 rounded" />
                <div className="h-3 w-1/2 bg-brand-slate/15 rounded" />
                <div className="flex items-center justify-between pt-1">
                  <div className="h-4 w-28 bg-brand-surface rounded" />
                  <div className="h-6 w-6 bg-brand-surface rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
