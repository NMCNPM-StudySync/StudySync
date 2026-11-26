import { Link } from 'react-router-dom';
import type { WeeklyStudyStatsResponse } from '../../../types/stats';

export interface StatsDetailPanelProps {
  stats: WeeklyStudyStatsResponse;
}

export function StatsDetailPanel({ stats }: StatsDetailPanelProps) {
  return (
    <div className="rounded-xl border border-brand-borderDefault bg-white p-5 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-brand-borderDefault/50">
          <h2 className="font-heading text-lg font-bold text-brand-navy">Dữ liệu thống kê</h2>
          <span className="inline-flex items-center rounded-full bg-brand-surface px-2.5 py-0.5 text-xs font-semibold text-brand-primary">
            {stats.totalMinutes} phút
          </span>
        </div>

        <div className="mt-4 space-y-3 text-xs">
          <div className="flex items-center justify-between py-1">
            <span className="text-brand-slate">Trạng thái</span>
            <span className="font-semibold text-brand-navy font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
              studied
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-brand-slate">Thời gian</span>
            <span className="font-semibold text-brand-navy">Thực tế</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-brand-slate">Phạm vi</span>
            <span className="font-semibold text-brand-navy">7 ngày</span>
          </div>
        </div>

        <div className="my-4 border-t border-brand-borderDefault/50" />

        <p className="text-xs text-brand-muted leading-relaxed">
          Tổng phút thực tế của các buổi đã học, từ Thứ 2 đến Chủ Nhật. Không phân chia theo môn học
          nhằm tuân thủ quy tắc bảo mật riêng tư (BR-02).
        </p>
      </div>

      <div className="pt-4 mt-4 border-t border-brand-borderDefault/40">
        <Link
          to="/calendar"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:text-brand-hover hover:underline transition-colors"
        >
          <span>Xem lịch tuần</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
