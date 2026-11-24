import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../src/shared/base-repository';
import { ValidationError } from '../src/shared/errors';
import { StatsRepository } from '../src/modules/stats/stats.repository';
import { getVietnamCurrentWeekBounds, StatsService } from '../src/modules/stats/stats.service';

describe('StatsService', () => {
  let repo: StatsRepository;
  let mockDb: Queryable;
  let service: StatsService;

  const userId = 'user-uuid-1';

  beforeEach(() => {
    repo = new StatsRepository();
    mockDb = {
      query: vi.fn(),
    };
    service = new StatsService(repo, mockDb);
  });

  describe('getVietnamCurrentWeekBounds', () => {
    it('tính đúng mốc tuần từ Thứ Hai 00:00:00 đến Thứ Hai tuần sau 00:00:00 giờ VN', () => {
      // Giả lập thời điểm: Thứ Tư 11/11/2026 lúc 10:00:00 UTC (17:00:00 giờ VN)
      const now = new Date('2026-11-11T10:00:00.000Z');
      const bounds = getVietnamCurrentWeekBounds(now);

      // Thứ Hai 09/11/2026 00:00:00 VN = 08/11/2026 17:00:00 UTC
      expect(bounds.from.toISOString()).toBe('2026-11-08T17:00:00.000Z');
      // Thứ Hai kế tiếp 16/11/2026 00:00:00 VN = 15/11/2026 17:00:00 UTC
      expect(bounds.to.toISOString()).toBe('2026-11-15T17:00:00.000Z');
    });

    it('tính đúng mốc tuần khi thời điểm là Chủ Nhật đêm muộn theo giờ VN', () => {
      // Chủ Nhật 15/11/2026 lúc 16:30:00 UTC = 23:30:00 giờ VN
      const now = new Date('2026-11-15T16:30:00.000Z');
      const bounds = getVietnamCurrentWeekBounds(now);

      expect(bounds.from.toISOString()).toBe('2026-11-08T17:00:00.000Z');
      expect(bounds.to.toISOString()).toBe('2026-11-15T17:00:00.000Z');
    });
  });

  describe('getWeeklyStats', () => {
    const fixedNow = new Date('2026-11-11T10:00:00.000Z'); // Tuần 09/11 - 15/11/2026

    it('trả về đủ 7 ngày liên tục và tổng thời lượng khi không truyền from/to (lấy tuần hiện tại)', async () => {
      vi.spyOn(repo, 'getWeeklyStats').mockResolvedValue({
        totalMinutes: 270,
        days: [
          { date: '2026-11-09', dayOfWeek: 1, minutes: 90 },
          { date: '2026-11-11', dayOfWeek: 3, minutes: 120 },
          { date: '2026-11-13', dayOfWeek: 5, minutes: 60 },
        ],
      });

      const res = await service.getWeeklyStats(userId, undefined, undefined, fixedNow);

      expect(res.from).toBe('2026-11-08T17:00:00.000Z');
      expect(res.to).toBe('2026-11-15T17:00:00.000Z');
      expect(res.totalMinutes).toBe(270);
      expect(res.days).toHaveLength(7);
      // Ngày không có trong CSDL tự điền minutes: 0
      expect(res.days.find((d) => d.dayOfWeek === 2)?.minutes).toBe(0);
      expect(res.days.find((d) => d.dayOfWeek === 1)?.minutes).toBe(90);
    });

    it('TC-137: từ chối khi chỉ truyền from hoặc chỉ truyền to với mã 400 VALIDATION_ERROR', async () => {
      await expect(
        service.getWeeklyStats(userId, '2026-11-08T17:00:00.000Z', undefined, fixedNow),
      ).rejects.toThrow(ValidationError);

      await expect(
        service.getWeeklyStats(userId, undefined, '2026-11-15T17:00:00.000Z', fixedNow),
      ).rejects.toThrow(ValidationError);
    });

    it('TC-137: từ chối chuỗi thời gian có offset +07:00 hoặc thiếu Z với mã 400 VALIDATION_ERROR', async () => {
      await expect(
        service.getWeeklyStats(
          userId,
          '2026-11-09T00:00:00+07:00',
          '2026-11-16T00:00:00+07:00',
          fixedNow,
        ),
      ).rejects.toThrow(ValidationError);

      await expect(
        service.getWeeklyStats(userId, '2026-11-08T17:00:00', '2026-11-15T17:00:00', fixedNow),
      ).rejects.toThrow(ValidationError);
    });

    it('TC-137: từ chối khoảng thời gian không đúng 7 ngày hoặc không bắt đầu vào 00:00:00 Thứ Hai giờ VN', async () => {
      // 5 ngày thay vì 7 ngày
      await expect(
        service.getWeeklyStats(
          userId,
          '2026-11-08T17:00:00.000Z',
          '2026-11-13T17:00:00.000Z',
          fixedNow,
        ),
      ).rejects.toThrow(ValidationError);

      // Bắt đầu vào Thứ Ba thay vì Thứ Hai
      await expect(
        service.getWeeklyStats(
          userId,
          '2026-11-09T17:00:00.000Z',
          '2026-11-16T17:00:00.000Z',
          fixedNow,
        ),
      ).rejects.toThrow(ValidationError);
    });

    it('TC-137: chặn xem thống kê tuần tương lai với mã 400 VALIDATION_ERROR', async () => {
      // Tuần tiếp theo: bắt đầu từ 15/11/2026 17:00:00 UTC (16/11 giờ VN) trong khi hiện tại là 11/11/2026
      const futureFrom = '2026-11-15T17:00:00.000Z';
      const futureTo = '2026-11-22T17:00:00.000Z';

      await expect(service.getWeeklyStats(userId, futureFrom, futureTo, fixedNow)).rejects.toThrow(
        ValidationError,
      );
    });

    it('TC-136 & TC-138: xử lý kết quả tuần quá khứ hợp lệ', async () => {
      const pastFrom = '2026-11-01T17:00:00.000Z';
      const pastTo = '2026-11-08T17:00:00.000Z';

      vi.spyOn(repo, 'getWeeklyStats').mockResolvedValue({
        totalMinutes: 180,
        days: [
          { date: '2026-11-02', dayOfWeek: 1, minutes: 60 },
          { date: '2026-11-08', dayOfWeek: 7, minutes: 120 },
        ],
      });

      const res = await service.getWeeklyStats(userId, pastFrom, pastTo, fixedNow);
      expect(res.totalMinutes).toBe(180);
      expect(res.days.find((d) => d.dayOfWeek === 7)?.minutes).toBe(120);
    });
  });
});
