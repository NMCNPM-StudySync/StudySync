/**
 * Unit tests cho hàm tiện ích hiển thị giờ Việt Nam — Tuân thủ BR-07
 *
 * Bao phủ:
 * 1. Ca biên qua nửa đêm: 23:30 UTC → 06:30 VN ngày kế tiếp (U045 / US-10)
 * 2. Ca đúng giờ UTC+7 thông thường
 * 3. Có và không có mili giây (.000Z vs Z)
 * 4. Đầu vào không hợp lệ ném lỗi đúng
 * 5. Thứ Hai theo giờ VN khi đầu vào là Chủ Nhật đêm UTC
 *
 * Issue #70 — Task 17 — Người viết: Kiên (tkien-ngdinh)
 */

import { describe, it, expect } from 'vitest';
import {
  formatVietnamDateTime,
  toVietnamDateString,
  formatVietnamFull,
  toVietnamMidnight,
} from '../../src/utils/vietnam-time';

describe('vietnam-time utilities (BR-07, UTC+7)', () => {
  // ─── formatVietnamDateTime ───────────────────────────────────────────────

  describe('formatVietnamDateTime', () => {
    it('CA BIÊN: 23:30 UTC Chủ Nhật → 06:30 Thứ Hai VN (U045 / US-10)', () => {
      // 2026-11-01 Chủ Nhật 23:30 UTC = 2026-11-02 Thứ Hai 06:30 VN
      expect(formatVietnamDateTime('2026-11-01T23:30:00.000Z')).toBe('06:30 02/11/2026');
    });

    it('CA BIÊN: 23:59:59 UTC → vẫn còn ngày cũ ở VN (nếu chưa qua 17:00 UTC)', () => {
      // 2026-11-05T10:00:00.000Z = 17:00 05/11/2026 VN
      expect(formatVietnamDateTime('2026-11-05T10:00:00.000Z')).toBe('17:00 05/11/2026');
    });

    it('chấp nhận chuỗi không có mili giây (đuôi Z thuần)', () => {
      // 2026-11-05T13:00:00Z = 20:00 05/11/2026 VN
      expect(formatVietnamDateTime('2026-11-05T13:00:00Z')).toBe('20:00 05/11/2026');
    });

    it('chấp nhận chuỗi có mili giây (đuôi .000Z)', () => {
      expect(formatVietnamDateTime('2026-11-10T01:00:00.000Z')).toBe('08:00 10/11/2026');
    });

    it('nửa đêm UTC (00:00Z) → 07:00 VN cùng ngày', () => {
      expect(formatVietnamDateTime('2026-11-12T00:00:00.000Z')).toBe('07:00 12/11/2026');
    });

    it('17:00 UTC → 00:00 VN ngày kế (đúng biên nửa đêm VN)', () => {
      // 2026-11-11T17:00:00.000Z = 00:00 12/11/2026 VN
      expect(formatVietnamDateTime('2026-11-11T17:00:00.000Z')).toBe('00:00 12/11/2026');
    });

    it('ném lỗi khi đầu vào rỗng', () => {
      expect(() => formatVietnamDateTime('')).toThrow();
    });

    it('ném lỗi khi không có hậu tố Z', () => {
      expect(() => formatVietnamDateTime('2026-11-05T13:00:00+07:00')).toThrow();
    });

    it('ném lỗi khi không phải chuỗi ngày', () => {
      expect(() => formatVietnamDateTime('not-a-date')).toThrow();
    });
  });

  // ─── toVietnamDateString ─────────────────────────────────────────────────

  describe('toVietnamDateString', () => {
    it('CA BIÊN: 23:30 UTC Chủ Nhật → ngày Thứ Hai VN', () => {
      // 2026-11-01T23:30:00.000Z UTC = 02/11/2026 VN
      expect(toVietnamDateString('2026-11-01T23:30:00.000Z')).toBe('02/11/2026');
    });

    it('nửa đêm UTC → vẫn là ngày đó ở VN (do VN đi trước UTC 7h)', () => {
      // 2026-11-12T00:00:00.000Z = 12/11/2026 VN
      expect(toVietnamDateString('2026-11-12T00:00:00.000Z')).toBe('12/11/2026');
    });

    it('16:59 UTC → vẫn là ngày cũ ở VN', () => {
      // 2026-11-11T16:59:00.000Z = 23:59 11/11/2026 VN
      expect(toVietnamDateString('2026-11-11T16:59:00.000Z')).toBe('11/11/2026');
    });

    it('17:00 UTC → sang ngày mới ở VN', () => {
      // 2026-11-11T17:00:00.000Z = 00:00 12/11/2026 VN
      expect(toVietnamDateString('2026-11-11T17:00:00.000Z')).toBe('12/11/2026');
    });

    it('ném lỗi khi không có hậu tố Z', () => {
      expect(() => toVietnamDateString('2026-11-05 20:00:00')).toThrow();
    });
  });

  // ─── formatVietnamFull ───────────────────────────────────────────────────

  describe('formatVietnamFull', () => {
    it('CA BIÊN: 23:30 UTC Chủ Nhật → "Thứ Hai, 02/11/2026 lúc 06:30"', () => {
      const result = formatVietnamFull('2026-11-01T23:30:00.000Z');
      expect(result).toBe('Thứ Hai, 02/11/2026 lúc 06:30');
    });

    it('ngày thường: 2026-11-10T01:00:00.000Z → Thứ Ba, 10/11/2026 lúc 08:00', () => {
      const result = formatVietnamFull('2026-11-10T01:00:00.000Z');
      expect(result).toBe('Thứ Ba, 10/11/2026 lúc 08:00');
    });
  });

  // ─── toVietnamMidnight ───────────────────────────────────────────────────

  describe('toVietnamMidnight', () => {
    it('trả về Date đúng nửa đêm VN của ngày tính theo giờ VN', () => {
      // 2026-11-01T23:30:00.000Z UTC = 02/11/2026 VN → nửa đêm VN 02/11 = 2026-11-01T17:00:00Z
      const midnight = toVietnamMidnight('2026-11-01T23:30:00.000Z');
      // Nửa đêm 02/11/2026 VN = 01/11/2026 17:00:00 UTC
      expect(midnight.toISOString()).toBe('2026-11-01T17:00:00.000Z');
    });

    it('nửa đêm 12/11/2026 VN = 11/11/2026 17:00 UTC', () => {
      const midnight = toVietnamMidnight('2026-11-12T00:00:00.000Z');
      expect(midnight.toISOString()).toBe('2026-11-11T17:00:00.000Z');
    });
  });
});
