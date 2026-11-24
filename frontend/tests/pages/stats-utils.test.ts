import { describe, expect, it } from 'vitest';
import {
  formatAveragePerDay,
  formatDateToDayMonth,
  formatDurationHoursMinutes,
  formatWeekDateRange,
  getIsoWeekNumber,
  getPeakDays,
  getVietnamCurrentWeekBounds,
  getWeekBoundsWithOffset,
} from '../../src/pages/stats/stats-utils';
import type { DayStudyStat } from '../../src/types/stats';

describe('stats-utils — Tiện ích tính toán và định dạng thống kê tuần TV5', () => {
  describe('getVietnamCurrentWeekBounds', () => {
    it('tính toán đúng mốc bắt đầu Thứ Hai 00:00:00 giờ VN (17:00Z Chủ Nhật trước) cho ngày giữa tuần', () => {
      // Thứ Tư 25/11/2026 10:00:00 UTC (17:00:00 VN)
      const mockNow = new Date('2026-11-25T10:00:00.000Z');
      const { from, to } = getVietnamCurrentWeekBounds(mockNow);

      // Thứ Hai tuần đó là 23/11/2026 00:00:00 VN -> 2026-11-22T17:00:00.000Z
      expect(from.toISOString()).toBe('2026-11-22T17:00:00.000Z');
      // Thứ Hai tuần sau là 30/11/2026 00:00:00 VN -> 2026-11-29T17:00:00.000Z
      expect(to.toISOString()).toBe('2026-11-29T17:00:00.000Z');
      expect(to.getTime() - from.getTime()).toBe(7 * 24 * 60 * 60 * 1000);
    });

    it('tính toán đúng mốc khi đang là Chủ Nhật đêm giờ VN', () => {
      // Chủ Nhật 29/11/2026 23:30:00 VN -> 2026-11-29T16:30:00.000Z
      const mockNow = new Date('2026-11-29T16:30:00.000Z');
      const { from, to } = getVietnamCurrentWeekBounds(mockNow);

      expect(from.toISOString()).toBe('2026-11-22T17:00:00.000Z');
      expect(to.toISOString()).toBe('2026-11-29T17:00:00.000Z');
    });
  });

  describe('getWeekBoundsWithOffset', () => {
    it('lùi chính xác 7 ngày khi offset = -1 (tuần trước)', () => {
      const mockNow = new Date('2026-11-25T10:00:00.000Z');
      const { from, to } = getWeekBoundsWithOffset(-1, mockNow);

      // Tuần trước: 16/11/2026 đến 23/11/2026 (giờ VN)
      expect(from.toISOString()).toBe('2026-11-15T17:00:00.000Z');
      expect(to.toISOString()).toBe('2026-11-22T17:00:00.000Z');
    });
  });

  describe('formatDurationHoursMinutes', () => {
    it('định dạng chính xác các trường hợp phút và giờ', () => {
      expect(formatDurationHoursMinutes(750)).toBe('12 giờ 30 phút');
      expect(formatDurationHoursMinutes(60)).toBe('1 giờ');
      expect(formatDurationHoursMinutes(120)).toBe('2 giờ');
      expect(formatDurationHoursMinutes(45)).toBe('45 phút');
      expect(formatDurationHoursMinutes(0)).toBe('0 giờ');
      expect(formatDurationHoursMinutes(-10)).toBe('0 giờ');
    });
  });

  describe('formatAveragePerDay', () => {
    it('tính toán và định dạng chính xác số giờ và phút trung bình mỗi ngày', () => {
      // 750 / 7 = 107.14 phút -> 1 giờ 47 phút -> "1g 47"
      expect(formatAveragePerDay(750)).toBe('1g 47');
      // 420 / 7 = 60 phút -> 1 giờ 00 phút -> "1g 00"
      expect(formatAveragePerDay(420)).toBe('1g 00');
      // 0 phút
      expect(formatAveragePerDay(0)).toBe('0g 00');
    });
  });

  describe('getPeakDays', () => {
    it('xác định đúng ngày cao nhất duy nhất', () => {
      const mockDays: DayStudyStat[] = [
        { date: '2026-11-09', dayOfWeek: 1, minutes: 90 },
        { date: '2026-11-10', dayOfWeek: 2, minutes: 120 },
        { date: '2026-11-11', dayOfWeek: 3, minutes: 60 },
      ];
      const result = getPeakDays(mockDays);
      expect(result.peakMinutes).toBe(120);
      expect(result.peakDayNames).toEqual(['Thứ 3']);
      expect(result.peakDayLabel).toBe('Thứ 3');
    });

    it('xác định đúng nhiều ngày đồng hạng cao nhất', () => {
      const mockDays: DayStudyStat[] = [
        { date: '2026-11-09', dayOfWeek: 1, minutes: 150 },
        { date: '2026-11-10', dayOfWeek: 2, minutes: 90 },
        { date: '2026-11-11', dayOfWeek: 3, minutes: 60 },
        { date: '2026-11-12', dayOfWeek: 4, minutes: 150 },
        { date: '2026-11-13', dayOfWeek: 5, minutes: 150 },
      ];
      const result = getPeakDays(mockDays);
      expect(result.peakMinutes).toBe(150);
      expect(result.peakDayNames).toEqual(['Thứ 2', 'Thứ 5', 'Thứ 6']);
      expect(result.peakDayLabel).toBe('Thứ 2, Thứ 5, Thứ 6');
    });

    it('trả về "Chưa có" khi toàn bộ tuần là 0 phút', () => {
      const mockDays: DayStudyStat[] = [
        { date: '2026-11-09', dayOfWeek: 1, minutes: 0 },
        { date: '2026-11-10', dayOfWeek: 2, minutes: 0 },
      ];
      const result = getPeakDays(mockDays);
      expect(result.peakMinutes).toBe(0);
      expect(result.peakDayLabel).toBe('Chưa có');
    });
  });

  describe('formatDateToDayMonth', () => {
    it('chuyển đổi YYYY-MM-DD sang DD/MM', () => {
      expect(formatDateToDayMonth('2026-11-09')).toBe('09/11');
      expect(formatDateToDayMonth('2026-05-02')).toBe('02/05');
      expect(formatDateToDayMonth('')).toBe('');
    });
  });

  describe('formatWeekDateRange & getIsoWeekNumber', () => {
    it('tính đúng số tuần ISO và dải ngày', () => {
      const from = '2026-11-08T17:00:00.000Z'; // Thứ Hai 09/11/2026 VN
      const to = '2026-11-15T17:00:00.000Z'; // Thứ Hai 16/11/2026 VN

      expect(getIsoWeekNumber(new Date('2026-11-09T00:00:00.000Z'))).toBe(46);
      const info = formatWeekDateRange(from, to);
      expect(info.weekNumber).toBe(46);
      expect(info.dateRangeText).toBe('09–15/11/2026');
      expect(info.fullLabel).toBe('Tuần 46 · 09–15/11/2026');
    });
  });
});
