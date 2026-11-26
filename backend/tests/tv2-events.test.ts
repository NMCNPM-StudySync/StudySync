import type { PoolClient } from 'pg';
import { describe, expect, it, vi } from 'vitest';
import { FixedEvent, type FixedEventKind } from '../src/modules/events/events.entity';
import { FixedEventRepository } from '../src/modules/events/events.repository';
import { FixedEventService } from '../src/modules/events/events.service';
import type { Queryable } from '../src/shared/base-repository';
import { NotFoundError, ValidationError } from '../src/shared/errors';

describe('TV2 Fixed Events Module', () => {
  const mockUserId = '11111111-1111-4111-8111-111111111111';

  // -------------------------------------------------------------------------
  // 1. Entity Tests
  // -------------------------------------------------------------------------
  describe('FixedEvent Entity', () => {
    it('chuyển đổi đúng sang TimeInterval nửa mở [startsAt, endsAt)', () => {
      const start = new Date('2026-11-16T08:00:00.000Z');
      const end = new Date('2026-11-16T10:00:00.000Z');

      const event = new FixedEvent({
        id: 'fe-1',
        userId: mockUserId,
        title: 'Công nghệ phần mềm',
        kind: 'class',
        startsAt: start,
        endsAt: end,
        source: 'manual',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const interval = event.toInterval();
      expect(interval.start).toEqual(start);
      expect(interval.end).toEqual(end);
    });

    it('kiểm tra va chạm trùng lịch tuân thủ BR-01: tiếp xúc mút không tính là trùng', () => {
      const e1 = new FixedEvent({
        id: 'fe-1',
        userId: mockUserId,
        title: 'Tiết 1-2',
        kind: 'class',
        startsAt: new Date('2026-11-16T07:30:00.000Z'),
        endsAt: new Date('2026-11-16T09:00:00.000Z'),
        source: 'manual',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const e2Adjacent = new FixedEvent({
        id: 'fe-2',
        userId: mockUserId,
        title: 'Tiết 3-4 (Nối tiếp)',
        kind: 'class',
        startsAt: new Date('2026-11-16T09:00:00.000Z'),
        endsAt: new Date('2026-11-16T10:30:00.000Z'),
        source: 'manual',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const e3Overlap = new FixedEvent({
        id: 'fe-3',
        userId: mockUserId,
        title: 'Học bù (Trùng 30 phút)',
        kind: 'class',
        startsAt: new Date('2026-11-16T08:30:00.000Z'),
        endsAt: new Date('2026-11-16T09:30:00.000Z'),
        source: 'manual',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Tiếp xúc mút: e1.endsAt === e2Adjacent.startsAt -> FALSE (BR-01)
      expect(e1.overlaps(e2Adjacent)).toBe(false);
      expect(e2Adjacent.overlaps(e1)).toBe(false);

      // Giao nhau một phần: e1 và e3Overlap -> TRUE
      expect(e1.overlaps(e3Overlap)).toBe(true);
      expect(e3Overlap.overlaps(e1)).toBe(true);
    });

    it('chuyển đổi sang Response DTO đầy đủ thuộc tính ISO 8601 UTC Z', () => {
      const event = new FixedEvent({
        id: 'fe-1',
        userId: mockUserId,
        title: 'Toán rời rạc',
        kind: 'exam',
        startsAt: new Date('2026-11-20T01:00:00.000Z'),
        endsAt: new Date('2026-11-20T03:00:00.000Z'),
        location: 'Phòng F.102',
        notes: 'Mang theo thẻ sinh viên',
        source: 'manual',
        createdAt: new Date('2026-11-10T00:00:00.000Z'),
        updatedAt: new Date('2026-11-10T00:00:00.000Z'),
        hasOverlap: true,
      });

      const dto = event.toResponseDto();
      expect(dto.id).toBe('fe-1');
      expect(dto.title).toBe('Toán rời rạc');
      expect(dto.kind).toBe('exam');
      expect(dto.startsAt).toBe('2026-11-20T01:00:00.000Z');
      expect(dto.endsAt).toBe('2026-11-20T03:00:00.000Z');
      expect(dto.location).toBe('Phòng F.102');
      expect(dto.hasOverlap).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // 2. Service Validation & Business Rules Tests
  // -------------------------------------------------------------------------
  describe('FixedEventService Validation & Business Rules', () => {
    const mockRepo = new FixedEventRepository();
    const mockDb: Queryable = { query: vi.fn() };
    const mockTxRunner = vi.fn(async (work) => work({} as unknown as PoolClient));
    const service = new FixedEventService(mockRepo, mockDb, mockTxRunner);

    it('từ chối khi tên sự kiện rỗng hoặc chỉ có khoảng trắng (BR-08)', async () => {
      await expect(
        service.createEvent(mockUserId, {
          title: '   ',
          startsAt: '2026-11-16T08:00:00.000Z',
          endsAt: '2026-11-16T10:00:00.000Z',
        }),
      ).rejects.toThrow(ValidationError);
    });

    it('từ chối khi tên sự kiện vượt quá 200 ký tự (BR-08)', async () => {
      const longTitle = 'A'.repeat(201);
      await expect(
        service.createEvent(mockUserId, {
          title: longTitle,
          startsAt: '2026-11-16T08:00:00.000Z',
          endsAt: '2026-11-16T10:00:00.000Z',
        }),
      ).rejects.toThrow(ValidationError);
    });

    it('từ chối khi loại sự kiện kind không hợp lệ', async () => {
      await expect(
        service.createEvent(mockUserId, {
          title: 'Đi chơi',
          kind: 'party' as unknown as FixedEventKind,
          startsAt: '2026-11-16T08:00:00.000Z',
          endsAt: '2026-11-16T10:00:00.000Z',
        }),
      ).rejects.toThrow(ValidationError);
    });

    it('từ chối chuỗi thời gian thiếu hậu tố Z (BR-07)', async () => {
      await expect(
        service.createEvent(mockUserId, {
          title: 'Học mạng máy tính',
          startsAt: '2026-11-16T08:00:00+07:00', // dùng offset thay vì Z
          endsAt: '2026-11-16T10:00:00.000Z',
        }),
      ).rejects.toThrow(ValidationError);
    });

    it('từ chối khi thời gian kết thúc trước thời gian bắt đầu (BR-01, BR-06)', async () => {
      await expect(
        service.createEvent(mockUserId, {
          title: 'Lỗi giờ đảo ngược',
          startsAt: '2026-11-16T10:00:00.000Z',
          endsAt: '2026-11-16T08:00:00.000Z',
        }),
      ).rejects.toThrow('Thời gian kết thúc phải sau thời gian bắt đầu');
    });

    it('từ chối khi thời gian kết thúc bằng thời gian bắt đầu (thời lượng 0 phút)', async () => {
      await expect(
        service.createEvent(mockUserId, {
          title: 'Thời lượng 0 phút',
          startsAt: '2026-11-16T08:00:00.000Z',
          endsAt: '2026-11-16T08:00:00.000Z',
        }),
      ).rejects.toThrow('Thời gian kết thúc phải sau thời gian bắt đầu');
    });

    it('cho phép lưu sự kiện trùng lịch và đính kèm cảnh báo FIXED_EVENT_OVERLAP (BR-01)', async () => {
      const existing = new FixedEvent({
        id: 'existing-fe-1',
        userId: mockUserId,
        title: 'Lập trình Web',
        kind: 'class',
        startsAt: new Date('2026-11-16T08:00:00.000Z'),
        endsAt: new Date('2026-11-16T10:00:00.000Z'),
        source: 'manual',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.spyOn(mockRepo, 'findOverlapping').mockResolvedValueOnce([existing]);
      vi.spyOn(mockRepo, 'create').mockImplementationOnce(async (event) => event);

      const result = await service.createEvent(mockUserId, {
        title: 'Học bù Trí tuệ nhân tạo',
        startsAt: '2026-11-16T09:00:00.000Z',
        endsAt: '2026-11-16T11:00:00.000Z',
      });

      expect(result.data.title).toBe('Học bù Trí tuệ nhân tạo');
      expect(result.warnings).toBeDefined();
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings?.[0]?.code).toBe('FIXED_EVENT_OVERLAP');
    });

    it('lưu thành công không có cảnh báo khi sự kiện không bị trùng lịch', async () => {
      vi.spyOn(mockRepo, 'findOverlapping').mockResolvedValueOnce([]);
      vi.spyOn(mockRepo, 'create').mockImplementationOnce(async (event) => event);

      const result = await service.createEvent(mockUserId, {
        title: 'Học Tiếng Anh',
        startsAt: '2026-11-16T14:00:00.000Z',
        endsAt: '2026-11-16T16:00:00.000Z',
      });

      expect(result.data.title).toBe('Học Tiếng Anh');
      expect(result.warnings).toBeUndefined();
    });

    it('tạo quy tắc lặp hằng tuần khi isRecurring = true và bật/tắt lặp khi cập nhật', async () => {
      const txQueries: Array<{ sql: string; params?: unknown[] }> = [];
      const txClient = {
        query: vi.fn(async (sql: string, params?: unknown[]) => {
          txQueries.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
          return { rows: [], rowCount: 1 };
        }),
      } as unknown as PoolClient;
      const customTxRunner = vi.fn(async (work: (c: PoolClient) => Promise<unknown>) =>
        work(txClient),
      );
      const localRepo = new FixedEventRepository();
      const localService = new FixedEventService(localRepo, mockDb, customTxRunner as never);

      vi.spyOn(localRepo, 'findOverlapping').mockResolvedValue([]);
      const createManySpy = vi
        .spyOn(localRepo, 'createMany')
        .mockImplementation(async (events) => events);

      // 1. Tạo mới sự kiện lặp hằng tuần -> sinh đủ 12 tuần liên tiếp
      const created = await localService.createEvent(mockUserId, {
        title: 'Họp đồng bộ hằng tuần',
        kind: 'other',
        startsAt: '2026-11-24T13:00:00.000Z',
        endsAt: '2026-11-24T14:00:00.000Z',
        isRecurring: true,
      });

      expect(created.data.recurringRuleId).toBeTruthy();
      expect(txQueries[0]?.sql).toContain('INSERT INTO recurring_rules');
      expect(txQueries[0]?.params?.[2]).toBe('TU');
      expect(createManySpy).toHaveBeenCalledTimes(1);
      expect(createManySpy.mock.calls[0]?.[0]).toHaveLength(12);

      // 2. Tắt lặp lại khi cập nhật sự kiện -> xóa các buổi lặp phía sau và gỡ rule ở buổi hiện tại
      vi.spyOn(localRepo, 'findByIdAndUserId').mockResolvedValueOnce(created.data);
      vi.spyOn(localRepo, 'update').mockImplementationOnce(async (_id, _uid, fields) => {
        return new FixedEvent({
          id: created.data.id,
          userId: mockUserId,
          title: created.data.title,
          kind: created.data.kind,
          startsAt: created.data.startsAt,
          endsAt: created.data.endsAt,
          source: 'manual',
          recurringRuleId: fields.recurringRuleId ?? null,
          createdAt: created.data.createdAt,
          updatedAt: new Date(),
        });
      });

      const updated = await localService.updateEvent(mockUserId, created.data.id, {
        isRecurring: false,
      });
      expect(updated.data.recurringRuleId).toBeNull();
      expect(txQueries.some((q) => q.sql.includes('DELETE FROM fixed_events'))).toBe(true);
      expect(txQueries.some((q) => q.sql.includes('DELETE FROM recurring_rules'))).toBe(true);

      // 3. Bật lặp lại từ sự kiện đơn lẻ -> sinh thêm 11 buổi lặp cho các tuần tiếp theo
      vi.spyOn(localRepo, 'findByIdAndUserId').mockResolvedValueOnce(updated.data);
      vi.spyOn(localRepo, 'update').mockImplementationOnce(async (_id, _uid, fields) => {
        return new FixedEvent({
          id: updated.data.id,
          userId: mockUserId,
          title: updated.data.title,
          kind: updated.data.kind,
          startsAt: updated.data.startsAt,
          endsAt: updated.data.endsAt,
          source: 'manual',
          recurringRuleId: fields.recurringRuleId ?? null,
          createdAt: updated.data.createdAt,
          updatedAt: new Date(),
        });
      });

      const reEnabled = await localService.updateEvent(mockUserId, updated.data.id, {
        isRecurring: true,
      });
      expect(reEnabled.data.recurringRuleId).toBeTruthy();
      expect(createManySpy).toHaveBeenCalledTimes(2);
      expect(createManySpy.mock.calls[1]?.[0]).toHaveLength(11);
    });

    it('kiểm tra trùng lịch (BR-01) trên cả các buổi lặp theo sau khi tạo sự kiện hằng tuần', async () => {
      const txClient = {
        query: vi.fn(async () => ({ rows: [], rowCount: 1 })),
      } as unknown as PoolClient;
      const customTxRunner = vi.fn(async (work: (c: PoolClient) => Promise<unknown>) =>
        work(txClient),
      );
      const localRepo = new FixedEventRepository();
      const localService = new FixedEventService(localRepo, mockDb, customTxRunner as never);

      const week2Conflict = new FixedEvent({
        id: 'existing-week2',
        userId: mockUserId,
        title: 'Họp tổng kết giữa kỳ',
        kind: 'other',
        startsAt: new Date('2026-12-08T13:00:00.000Z'),
        endsAt: new Date('2026-12-08T14:00:00.000Z'),
        source: 'manual',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Buổi đầu (week 0) và buổi thứ 2 (week 1) không trùng, nhưng buổi thứ 3 (week 2) bị trùng
      vi.spyOn(localRepo, 'findOverlapping').mockImplementation(async (_uid, startsAt) => {
        if (startsAt.toISOString() === '2026-12-08T13:00:00.000Z') {
          return [week2Conflict];
        }
        return [];
      });
      vi.spyOn(localRepo, 'createMany').mockImplementation(async (events) => events);

      const created = await localService.createEvent(mockUserId, {
        title: 'Lớp thực hành tối',
        kind: 'class',
        startsAt: '2026-11-24T13:00:00.000Z',
        endsAt: '2026-11-24T14:00:00.000Z',
        isRecurring: true,
      });

      expect(created.warnings).toHaveLength(1);
      expect(created.warnings?.[0]?.code).toBe('FIXED_EVENT_OVERLAP');
      expect(created.warnings?.[0]?.message).toContain('1/12 buổi lặp bị trùng');
      expect(created.warnings?.[0]?.details?.[0]?.issue).toContain('Họp tổng kết giữa kỳ');
    });

    it('ném lỗi NotFoundError khi truy vấn sự kiện không tồn tại', async () => {
      vi.spyOn(mockRepo, 'findByIdAndUserId').mockResolvedValueOnce(null);

      await expect(service.getEvent(mockUserId, 'non-existent-id')).rejects.toThrow(NotFoundError);
    });

    it('bảo vệ quyền riêng tư theo BR-02: findBusyIntervals chỉ trả 3 trường user_id, starts_at, ends_at', async () => {
      const mockQueryRes = {
        rows: [
          {
            user_id: mockUserId,
            starts_at: '2026-11-16T08:00:00.000Z',
            ends_at: '2026-11-16T10:00:00.000Z',
          },
        ],
      };
      const customDb: Queryable = { query: vi.fn().mockResolvedValueOnce(mockQueryRes) };

      const intervals = await mockRepo.findBusyIntervals(
        [mockUserId],
        new Date('2026-11-16T00:00:00.000Z'),
        new Date('2026-11-17T00:00:00.000Z'),
        customDb,
      );

      expect(intervals).toHaveLength(1);
      const first = intervals[0];
      expect(first).toEqual({
        userId: mockUserId,
        startsAt: new Date('2026-11-16T08:00:00.000Z'),
        endsAt: new Date('2026-11-16T10:00:00.000Z'),
      });
      // Đảm bảo không lộ thông tin tiêu đề, mô tả, phòng học
      const record = first as unknown as Record<string, unknown>;
      expect(record.title).toBeUndefined();
      expect(record.location).toBeUndefined();
      expect(record.notes).toBeUndefined();
    });
  });
});
