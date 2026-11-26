import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StatsPage } from '../../src/pages/stats/StatsPage';
import { apiClient, ApiError } from '../../src/services/apiClient';
import type { WeeklyStudyStatsResponse } from '../../src/types/stats';

const mockWeeklyStatsSuccess: WeeklyStudyStatsResponse = {
  from: '2026-11-08T17:00:00.000Z',
  to: '2026-11-15T17:00:00.000Z',
  totalMinutes: 750,
  days: [
    { date: '2026-11-09', dayOfWeek: 1, minutes: 150 },
    { date: '2026-11-10', dayOfWeek: 2, minutes: 90 },
    { date: '2026-11-11', dayOfWeek: 3, minutes: 60 },
    { date: '2026-11-12', dayOfWeek: 4, minutes: 150 },
    { date: '2026-11-13', dayOfWeek: 5, minutes: 150 },
    { date: '2026-11-14', dayOfWeek: 6, minutes: 30 },
    { date: '2026-11-15', dayOfWeek: 7, minutes: 120 },
  ],
};

const mockWeeklyStatsEmpty: WeeklyStudyStatsResponse = {
  from: '2026-11-08T17:00:00.000Z',
  to: '2026-11-15T17:00:00.000Z',
  totalMinutes: 0,
  days: [
    { date: '2026-11-09', dayOfWeek: 1, minutes: 0 },
    { date: '2026-11-10', dayOfWeek: 2, minutes: 0 },
    { date: '2026-11-11', dayOfWeek: 3, minutes: 0 },
    { date: '2026-11-12', dayOfWeek: 4, minutes: 0 },
    { date: '2026-11-13', dayOfWeek: 5, minutes: 0 },
    { date: '2026-11-14', dayOfWeek: 6, minutes: 0 },
    { date: '2026-11-15', dayOfWeek: 7, minutes: 0 },
  ],
};

describe('StatsPage — Giao diện Thống kê học tập tuần TV5 (Issue #143)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('TC-UI-01: Render đầy đủ tiêu đề, dải ngữ cảnh, 3 card KPI và biểu đồ cột 7 ngày khi có dữ liệu', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: mockWeeklyStatsSuccess,
      warnings: [],
    });

    render(
      <MemoryRouter>
        <StatsPage />
      </MemoryRouter>,
    );

    // Tiêu đề h1 chuẩn xác
    expect(screen.getByRole('heading', { level: 1, name: 'Thống kê giờ học' })).toBeInTheDocument();

    // Dải thông tin ngữ cảnh
    await waitFor(() => {
      expect(screen.getByText('Khoảng thời gian')).toBeInTheDocument();
      expect(screen.getByText('Buổi học đã học')).toBeInTheDocument();
      expect(screen.getByText('UTC+7')).toBeInTheDocument();
    });

    // 3 thẻ KPI
    expect(screen.getByText('12 giờ 30 phút')).toBeInTheDocument();
    expect(screen.getByText('Tổng thời lượng: 750 phút')).toBeInTheDocument();
    expect(screen.getByText('1g 47')).toBeInTheDocument();
    expect(screen.getByText('750 phút / 7 ngày trong tuần')).toBeInTheDocument();
    expect(screen.getByText('Thứ 2, Thứ 5, Thứ 6')).toBeInTheDocument(); // dayOfWeek 1, 4, 5
    expect(screen.getByText('Mức cao nhất: 150 phút/ngày')).toBeInTheDocument();

    // Biểu đồ cột 7 ngày
    expect(screen.getByText(/Tổng phút học mỗi ngày · tuần 46/i)).toBeInTheDocument();
    expect(screen.getByText('09/11')).toBeInTheDocument();
    expect(screen.getByText('15/11')).toBeInTheDocument();

    // Thẻ chi tiết và Đọc nhanh
    expect(screen.getByRole('heading', { level: 2, name: 'Dữ liệu thống kê' })).toBeInTheDocument();
    expect(screen.getByText('studied')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Xem lịch tuần/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Đọc nhanh' })).toBeInTheDocument();
  });

  it('TC-UI-02: Render đúng Empty State khi tuần chưa có dữ liệu học (totalMinutes = 0)', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: mockWeeklyStatsEmpty,
      warnings: [],
    });

    render(
      <MemoryRouter>
        <StatsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      // Banner thông báo thân thiện chuẩn Mục 6.3.1 M3 và aria-live="polite" (W-05)
      const statusBanner = screen.getByRole('status');
      expect(statusBanner).toHaveAttribute('aria-live', 'polite');
      expect(screen.getByText('Chưa có dữ liệu học tập cho tuần này')).toBeInTheDocument();
      expect(
        screen.getByText('Hãy đánh dấu hoàn thành các buổi học trên Lịch để ghi nhận thống kê.'),
      ).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Xem Lịch tuần' })).toBeInTheDocument();
    });

    // Giá trị KPI ở mức 0 nhưng bố cục vẫn giữ vững
    expect(screen.getByText('0 giờ')).toBeInTheDocument();
    expect(screen.getByText('0g 00')).toBeInTheDocument();
    expect(screen.getByText('Chưa có')).toBeInTheDocument();
  });

  it('TC-UI-03: Luôn gửi cặp from/to cho cả tuần hiện tại và tuần trước khi điều hướng (B-01, B-02)', async () => {
    const getSpy = vi
      .spyOn(apiClient, 'get')
      .mockResolvedValueOnce({
        data: mockWeeklyStatsSuccess,
        warnings: [],
      })
      .mockResolvedValueOnce({
        data: {
          ...mockWeeklyStatsSuccess,
          from: '2026-11-01T17:00:00.000Z',
          to: '2026-11-08T17:00:00.000Z',
          totalMinutes: 480,
        },
        warnings: [],
      });

    render(
      <MemoryRouter>
        <StatsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('12 giờ 30 phút')).toBeInTheDocument();
    });

    // Lần gọi đầu (tuần hiện tại) cũng phải gửi đúng cặp from/to dài 7 ngày
    const firstCallParams = getSpy.mock.calls[0]?.[1]?.params as { from: string; to: string };
    expect(firstCallParams?.from).toBeTruthy();
    expect(firstCallParams?.to).toBeTruthy();
    const diff1 = new Date(firstCallParams.to).getTime() - new Date(firstCallParams.from).getTime();
    expect(diff1).toBe(7 * 24 * 60 * 60 * 1000);

    // Nhấn nút "Tuần trước"
    const prevWeekBtn = screen.getByRole('button', { name: 'Xem tuần trước' });
    fireEvent.click(prevWeekBtn);

    await waitFor(() => {
      expect(getSpy).toHaveBeenCalledTimes(2);
      const secondCallParams = getSpy.mock.calls[1]?.[1]?.params as { from: string; to: string };
      expect(secondCallParams.to).toBe(firstCallParams.from);
      expect(
        new Date(secondCallParams.to).getTime() - new Date(secondCallParams.from).getTime(),
      ).toBe(7 * 24 * 60 * 60 * 1000);
    });
  });

  it('TC-UI-04: Nút "Tuần sau" bị vô hiệu hóa (disabled) khi đang ở tuần hiện tại (TC-137)', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: mockWeeklyStatsSuccess,
      warnings: [],
    });

    render(
      <MemoryRouter>
        <StatsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('12 giờ 30 phút')).toBeInTheDocument();
    });

    const nextWeekBtn = screen.getByRole('button', { name: 'Xem tuần sau' });
    expect(nextWeekBtn).toBeDisabled();
    expect(nextWeekBtn).toHaveAttribute('title', 'Không thể xem tuần tương lai');
  });

  it('TC-UI-05: Hiển thị Skeleton Loading trong khi API đang tải dữ liệu', () => {
    // Trả về Promise chưa resolve để giữ trạng thái loading
    vi.spyOn(apiClient, 'get').mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter>
        <StatsPage />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText('Đang nạp dữ liệu thống kê')).toBeInTheDocument();
  });

  it('TC-UI-06: Hiển thị thông báo lỗi và nút "Thử lại" khi API gặp sự cố', async () => {
    const getSpy = vi
      .spyOn(apiClient, 'get')
      .mockRejectedValueOnce(new ApiError('Lỗi máy chủ nội bộ', 500, 'INTERNAL_ERROR'))
      .mockResolvedValueOnce({
        data: mockWeeklyStatsSuccess,
        warnings: [],
      });

    render(
      <MemoryRouter>
        <StatsPage />
      </MemoryRouter>,
    );

    // Báo lỗi xuất hiện
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Lỗi máy chủ nội bộ')).toBeInTheDocument();
    });

    // Bấm nút "Thử lại"
    const retryBtn = screen.getByRole('button', { name: 'Thử lại' });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(getSpy).toHaveBeenCalledTimes(2);
      expect(screen.getByText('12 giờ 30 phút')).toBeInTheDocument();
    });
  });

  it('TC-UI-07: Cho phép lùi quá 4 tuần lịch sử và có nút quay về tuần hiện tại (B-03, W-04)', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: mockWeeklyStatsSuccess,
      warnings: [],
    });

    render(
      <MemoryRouter>
        <StatsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('12 giờ 30 phút')).toBeInTheDocument();
    });

    const prevWeekBtn = screen.getByRole('button', { name: 'Xem tuần trước' });
    for (let i = 0; i < 5; i += 1) {
      fireEvent.click(prevWeekBtn);
      await waitFor(() => {
        expect(getSpy).toHaveBeenCalledTimes(i + 2);
      });
    }

    // Không bị khóa cứng ở -4 tuần
    expect(prevWeekBtn).toBeEnabled();

    // Bấm quay về tuần hiện tại
    const resetBtn = screen.getByRole('button', { name: 'Quay về tuần hiện tại' });
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(getSpy).toHaveBeenCalledTimes(7);
      expect(screen.getByRole('button', { name: 'Xem tuần sau' })).toBeDisabled();
    });
  });

  it('TC-UI-08: Ẩn error banner cũ khi đang loading chuyển sang tuần khác (W-03)', async () => {
    vi.spyOn(apiClient, 'get')
      .mockRejectedValueOnce(new ApiError('Lỗi máy chủ nội bộ', 500, 'INTERNAL_ERROR'))
      .mockReturnValueOnce(new Promise(() => {}));

    render(
      <MemoryRouter>
        <StatsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Xem tuần trước' }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Đang nạp dữ liệu thống kê')).toBeInTheDocument();
  });
});
