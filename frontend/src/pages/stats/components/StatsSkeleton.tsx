export function StatsSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse" aria-label="Đang nạp dữ liệu thống kê">
      {/* Skeleton Top Context Box */}
      <div className="h-20 rounded-xl bg-gray-200/70" />

      {/* Skeleton 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-28 rounded-xl bg-gray-200/70" />
        <div className="h-28 rounded-xl bg-gray-200/70" />
        <div className="h-28 rounded-xl bg-gray-200/70" />
      </div>

      {/* Skeleton Chart & Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-72 rounded-xl bg-gray-200/70" />
        <div className="h-72 rounded-xl bg-gray-200/70" />
      </div>

      {/* Skeleton Insights */}
      <div className="h-24 rounded-xl bg-gray-200/70" />
    </div>
  );
}
