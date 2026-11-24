import type { PoolClient } from 'pg';
import { describe, expect, it, vi } from 'vitest';
import { Task } from '../src/modules/tasks/tasks.entity';
import { TaskRepository } from '../src/modules/tasks/tasks.repository';
import { TaskService } from '../src/modules/tasks/tasks.service';
import type { Queryable } from '../src/shared/base-repository';
import { NotFoundError, ValidationError } from '../src/shared/errors';

describe('TV2 Tasks Module', () => {
  const mockUserId = '22222222-2222-4222-8222-222222222222';

  // -------------------------------------------------------------------------
  // 1. Entity Tests
  // -------------------------------------------------------------------------
  describe('Task Entity', () => {
    it('kiểm tra việc quá hạn chính xác qua hàm isPastDue (BR-04)', () => {
      const past = new Date(Date.now() - 3600 * 1000); // 1 giờ trước
      const future = new Date(Date.now() + 3600 * 1000); // 1 giờ sau

      const pastTask = new Task({
        id: 'task-1',
        userId: mockUserId,
        title: 'Nộp bài tập 1',
        dueAt: past,
        priority: 'high',
        difficulty: 'medium',
        durationMinutes: 60,
        isDone: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const futureTask = new Task({
        id: 'task-2',
        userId: mockUserId,
        title: 'Ôn thi cuối kỳ',
        dueAt: future,
        priority: 'high',
        difficulty: 'hard',
        durationMinutes: 120,
        isDone: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(pastTask.isPastDue()).toBe(true);
      expect(futureTask.isPastDue()).toBe(false);
    });

    it('chuyển đổi sang Response DTO đầy đủ trường camelCase và ISO 8601 UTC Z', () => {
      const task = new Task({
        id: 'task-1',
        userId: mockUserId,
        title: 'Soạn thảo tài liệu',
        dueAt: new Date('2026-11-25T17:00:00.000Z'),
        priority: 'medium',
        difficulty: 'easy',
        durationMinutes: 60,
        isDone: false,
        createdAt: new Date('2026-11-20T00:00:00.000Z'),
        updatedAt: new Date('2026-11-20T00:00:00.000Z'),
      });

      const dto = task.toResponseDto();
      expect(dto.id).toBe('task-1');
      expect(dto.title).toBe('Soạn thảo tài liệu');
      expect(dto.dueAt).toBe('2026-11-25T17:00:00.000Z');
      expect(dto.priority).toBe('medium');
      expect(dto.difficulty).toBe('easy');
      expect(dto.durationMinutes).toBe(60);
      expect(dto.isDone).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // 2. Service Validation & Business Rules Tests
  // -------------------------------------------------------------------------
  describe('TaskService Validation & Business Rules', () => {
    const mockRepo = new TaskRepository();
    const mockDb: Queryable = { query: vi.fn() };
    const mockTxRunner = vi.fn(async (work) => work({ query: vi.fn() } as unknown as PoolClient));
    const service = new TaskService(mockRepo, mockDb, mockTxRunner);

    it('từ chối khi tên việc cần làm để trống hoặc chỉ có khoảng trắng (BR-08)', async () => {
      await expect(
        service.createTask(mockUserId, {
          title: '   ',
          dueAt: '2026-11-25T17:00:00.000Z',
        }),
      ).rejects.toThrow(ValidationError);
    });

    it('từ chối khi tên việc vượt quá 200 ký tự (BR-08)', async () => {
      const longTitle = 'B'.repeat(201);
      await expect(
        service.createTask(mockUserId, {
          title: longTitle,
          dueAt: '2026-11-25T17:00:00.000Z',
        }),
      ).rejects.toThrow(ValidationError);
    });

    it('từ chối khi thiếu hạn chót dueAt (BR-04)', async () => {
      await expect(
        service.createTask(mockUserId, {
          title: 'Không có deadline',
          dueAt: '',
        }),
      ).rejects.toThrow('Hạn chót hoàn thành việc là bắt buộc');
    });

    it('từ chối chuỗi thời gian hạn chót thiếu hậu tố Z (BR-07)', async () => {
      await expect(
        service.createTask(mockUserId, {
          title: 'Viết báo cáo',
          dueAt: '2026-11-25T17:00:00+07:00', // dùng offset
        }),
      ).rejects.toThrow(ValidationError);
    });

    it('tự động gán thời lượng ước tính mặc định là 60 phút khi để trống (BR-04)', async () => {
      vi.spyOn(mockRepo, 'create').mockImplementationOnce(async (task) => task);

      const result = await service.createTask(mockUserId, {
        title: 'Học bài tuần 5',
        dueAt: '2026-11-30T17:00:00.000Z',
        // durationMinutes bị bỏ trống
      });

      expect(result.data.durationMinutes).toBe(60);
    });

    it('từ chối khi thời lượng ước tính <= 0 phút', async () => {
      await expect(
        service.createTask(mockUserId, {
          title: 'Thời lượng âm',
          dueAt: '2026-11-30T17:00:00.000Z',
          durationMinutes: -10,
        }),
      ).rejects.toThrow('Thời lượng ước tính phải là số nguyên dương lớn hơn 0');

      await expect(
        service.createTask(mockUserId, {
          title: 'Thời lượng 0',
          dueAt: '2026-11-30T17:00:00.000Z',
          durationMinutes: 0,
        }),
      ).rejects.toThrow('Thời lượng ước tính phải là số nguyên dương lớn hơn 0');
    });

    it('cho phép lưu việc có hạn chót trong quá khứ và phát sinh cảnh báo DEADLINE_PASSED (BR-04)', async () => {
      vi.spyOn(mockRepo, 'create').mockImplementationOnce(async (task) => task);

      const pastDue = new Date(Date.now() - 24 * 3600 * 1000).toISOString(); // Ngày hôm qua
      const result = await service.createTask(mockUserId, {
        title: 'Việc đã trễ hạn',
        dueAt: pastDue,
      });

      expect(result.data.title).toBe('Việc đã trễ hạn');
      expect(result.warnings).toBeDefined();
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings?.[0]?.code).toBe('DEADLINE_PASSED');
    });

    it('lưu thành công không có cảnh báo khi hạn chót ở tương lai', async () => {
      vi.spyOn(mockRepo, 'create').mockImplementationOnce(async (task) => task);

      const futureDue = new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(); // 5 ngày sau
      const result = await service.createTask(mockUserId, {
        title: 'Việc trong tương lai',
        dueAt: futureDue,
      });

      expect(result.data.title).toBe('Việc trong tương lai');
      expect(result.warnings).toBeUndefined();
    });

    it('ném lỗi NotFoundError khi truy vấn việc cần làm không tồn tại', async () => {
      vi.spyOn(mockRepo, 'findByIdAndUserId').mockResolvedValueOnce(null);

      await expect(service.getTask(mockUserId, 'non-existent-task-id')).rejects.toThrow(
        NotFoundError,
      );
    });

    it('hợp đồng liên module TV3: listOpenByUser loại trừ động việc đã hoàn thành hoặc quá hạn', async () => {
      const mockQueryRes = {
        rows: [
          {
            id: 'task-open-1',
            user_id: mockUserId,
            title: 'Việc chưa hoàn thành và còn hạn',
            due_at: '2026-11-30T17:00:00.000Z',
            priority: 'high',
            difficulty: 'medium',
            duration_minutes: 60,
            is_done: false,
            created_at: '2026-11-20T00:00:00.000Z',
            updated_at: '2026-11-20T00:00:00.000Z',
          },
        ],
      };
      const customDb: Queryable = { query: vi.fn().mockResolvedValueOnce(mockQueryRes) };

      const openTasks = await mockRepo.listOpenByUser(mockUserId, customDb);
      expect(openTasks).toHaveLength(1);
      expect(openTasks[0]?.title).toBe('Việc chưa hoàn thành và còn hạn');
      expect(openTasks[0]?.isDone).toBe(false);
    });
  });
});
