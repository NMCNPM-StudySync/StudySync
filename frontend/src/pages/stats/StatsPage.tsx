/**
 * Trang Thống kê học tập cá nhân theo tuần (/stats) — Module TV5
 * Trực quan hóa dữ liệu buổi học thực tế (status = 'studied') kết nối API TV5
 *
 * Tham chiếu thiết kế: Figma Node 5:2, Mục 6 M3, docs/api.md
 * Issue #143 — Người viết: Kiên (tkien-ngdinh)
 */

import { useEffect, useState } from 'react';
import { apiClient, ApiError } from '../../services/apiClient';
import type { WeeklyStudyStatsResponse } from '../../types/stats';
import { KpiSummaryCards } from './components/KpiSummaryCards';
import { QuickInsightsSection } from './components/QuickInsightsSection';
import { StatsDetailPanel } from './components/StatsDetailPanel';
import { StatsEmptyState } from './components/StatsEmptyState';
import { StatsHeader } from './components/StatsHeader';
import { StatsSkeleton } from './components/StatsSkeleton';
import { WeeklyStudyBarChart } from './components/WeeklyStudyBarChart';
import { formatWeekDateRange, getWeekBoundsWithOffset } from './stats-utils';

export function StatsPage() {
  const [stats, setStats] = useState<WeeklyStudyStatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState<number>(0); // 0 = tuần hiện tại, -1 = tuần trước
  const [retryTrigger, setRetryTrigger] = useState<number>(0);

  useEffect(() => {
    let isCancelled = false;

    const { from, to } = getWeekBoundsWithOffset(weekOffset);
    const request = apiClient.get<WeeklyStudyStatsResponse>('/statistics/weekly', {
      params: {
        from: from.toISOString(),
        to: to.toISOString(),
      },
    });

    request
      .then((response) => {
        if (!isCancelled) {
          setStats(response.data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          if (err instanceof ApiError) {
            setError(err.message || 'Không thể lấy dữ liệu thống kê từ máy chủ.');
          } else if (err instanceof Error) {
            setError(err.message);
          } else {
            setError(
              'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng và thử lại.',
            );
          }
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [weekOffset, retryTrigger]);

  const handleWeekChange = (newOffset: number) => {
    // Không cho phép xem tuần tương lai (newOffset > 0) theo U045 và TC-137
    if (newOffset > 0) return;
    setLoading(true);
    setError(null);
    setWeekOffset(newOffset);
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryTrigger((prev) => prev + 1);
  };

  const weekInfo = stats ? formatWeekDateRange(stats.from, stats.to) : null;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-10">
      {/* Header và Bộ điều hướng chọn tuần */}
      <StatsHeader
        stats={stats}
        weekOffset={weekOffset}
        onWeekChange={handleWeekChange}
        isLoading={loading}
      />

      {/* Hiển thị lỗi kết nối nếu có */}
      {!loading && error && (
        <div
          role="alert"
          className="flex items-center justify-between p-4 rounded-xl border border-brand-alert bg-brand-alert/40 text-brand-alertText shadow-sm"
        >
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="text-xs sm:text-sm font-medium">{error}</span>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className="px-3 py-1 rounded-lg text-xs font-semibold bg-white border border-brand-alertText/30 text-brand-alertText hover:bg-brand-alert transition-colors cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Hiển thị Loading Skeleton hoặc Nội dung chính */}
      {loading ? (
        <StatsSkeleton />
      ) : stats ? (
        <div className="flex flex-col gap-6">
          {/* Thông báo trạng thái trống (Empty State) theo Mục 6.3.1 M3 */}
          {stats.totalMinutes === 0 && <StatsEmptyState />}

          {/* 3 Thẻ tóm tắt chỉ số chính (KPI Cards) */}
          <KpiSummaryCards stats={stats} />

          {/* Khối nội dung chính: Biểu đồ cột 7 ngày (trái) và Thẻ chi tiết (phải) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            <div className="lg:col-span-2">
              <WeeklyStudyBarChart
                days={stats.days}
                weekLabel={weekInfo ? `tuần ${weekInfo.weekNumber}` : ''}
              />
            </div>
            <div>
              <StatsDetailPanel stats={stats} />
            </div>
          </div>

          {/* Khối nhận xét nhanh ("Đọc nhanh") */}
          <QuickInsightsSection stats={stats} />
        </div>
      ) : null}
    </div>
  );
}
