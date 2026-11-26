export function CalendarSkeleton() {
  return (
    <div
      className="space-y-5 animate-pulse"
      role="status"
      aria-label="Đang tải dữ liệu lịch tuần"
      aria-busy="true"
    >
      {/* Khung tóm tắt đầu trang */}
      <div className="rounded-2xl border border-brand-borderDefault bg-white p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((idx) => (
            <div key={idx} className="space-y-2">
              <div className="h-3 w-20 rounded bg-brand-surface" />
              <div className="h-6 w-28 rounded bg-brand-surface/80" />
              <div className="h-3 w-24 rounded bg-brand-bg" />
            </div>
          ))}
        </div>
      </div>

      {/* Lưới lịch + Thanh bên */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-2xl border border-brand-borderDefault bg-white p-4">
          <div className="mb-4 grid grid-cols-8 gap-2">
            <div className="h-10 rounded bg-brand-bg" />
            {[0, 1, 2, 3, 4, 5, 6].map((col) => (
              <div key={col} className="h-10 rounded-lg bg-brand-surface/70" />
            ))}
          </div>
          <div className="grid grid-cols-8 gap-2">
            <div className="space-y-6 py-2">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((row) => (
                <div key={row} className="h-3 w-8 rounded bg-brand-bg" />
              ))}
            </div>
            {[0, 1, 2, 3, 4, 5, 6].map((col) => (
              <div
                key={col}
                className="relative h-[420px] rounded-lg border border-brand-borderDefault/40 bg-brand-bg/30 p-1.5 space-y-3"
              >
                <div className="h-16 rounded-lg bg-brand-surface/80" />
                {col % 2 === 0 && <div className="mt-10 h-24 rounded-lg bg-brand-mint/70" />}
                {col % 3 === 1 && <div className="mt-6 h-12 rounded-lg bg-brand-warning/70" />}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-brand-borderDefault bg-white p-4 space-y-3">
            <div className="h-5 w-44 rounded bg-brand-surface" />
            <div className="h-16 rounded-xl bg-brand-alert/50" />
            <div className="h-16 rounded-xl bg-brand-warning/50" />
            <div className="h-12 rounded-xl bg-brand-bg" />
          </div>
          <div className="rounded-2xl border border-brand-borderDefault bg-white p-4 space-y-3">
            <div className="h-5 w-36 rounded bg-brand-surface" />
            <div className="h-12 rounded-lg bg-brand-bg" />
            <div className="h-12 rounded-lg bg-brand-bg" />
          </div>
        </div>
      </div>
      <span className="sr-only">Đang tải dữ liệu lịch tuần...</span>
    </div>
  );
}
