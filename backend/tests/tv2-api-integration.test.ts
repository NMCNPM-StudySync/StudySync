import request from 'supertest';
import type { PoolClient } from 'pg';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app';
import { CalendarImportService } from '../src/modules/events/calendar-import.service';
import { FixedEvent } from '../src/modules/events/events.entity';
import { FixedEventRepository } from '../src/modules/events/events.repository';
import { FixedEventService } from '../src/modules/events/events.service';
import { CsvParser } from '../src/modules/events/parsers/csv-parser';
import { IcsParser } from '../src/modules/events/parsers/ics-parser';
import { WeekScheduleService } from '../src/modules/schedule/schedule.service';
import { TaskRepository } from '../src/modules/tasks/tasks.repository';
import { TaskService } from '../src/modules/tasks/tasks.service';
import type { Queryable } from '../src/shared/base-repository';

describe('TV2 End-to-End API Integration', () => {
  const testUserId = '33333333-3333-4333-8333-333333333333';

  const eventsMap = new Map<string, Record<string, unknown>>();
  const tasksMap = new Map<string, Record<string, unknown>>();
  const importedFilesMap = new Map<string, Record<string, unknown>>();

  const mockDb: Queryable = {
    query: vi.fn(async (text: string, params?: unknown[]) => {
      const sql = text.replace(/\s+/g, ' ').trim();

      // 1. fixed_events queries
      if (
        sql.includes('FROM fixed_events') &&
        sql.includes('id = $1') &&
        sql.includes('user_id = $2')
      ) {
        const id = params?.[0] as string;
        const e = eventsMap.get(id);
        return { rows: e ? [e] : [], rowCount: e ? 1 : 0 };
      }
      if (
        sql.includes('FROM fixed_events') &&
        sql.includes('starts_at < $3') &&
        sql.includes('ends_at > $2')
      ) {
        return {
          rows: Array.from(eventsMap.values()),
          rowCount: eventsMap.size,
        };
      }
      if (sql.startsWith('INSERT INTO fixed_events')) {
        if (params && params.length >= 13) {
          const [
            id,
            userId,
            title,
            kind,
            startsAt,
            endsAt,
            location,
            notes,
            source,
            recurringRuleId,
            importedFileId,
            createdAt,
            updatedAt,
          ] = params as [
            string,
            string,
            string,
            string,
            string,
            string,
            string | null,
            string | null,
            string,
            string | null,
            string | null,
            string,
            string,
          ];
          const row = {
            id,
            user_id: userId,
            title,
            kind,
            starts_at: startsAt,
            ends_at: endsAt,
            location,
            notes,
            source,
            recurring_rule_id: recurringRuleId,
            imported_file_id: importedFileId,
            created_at: createdAt,
            updated_at: updatedAt,
          };
          eventsMap.set(id, row);
          return { rows: [row], rowCount: 1 };
        }
        return { rows: [], rowCount: 0 };
      }
      if (sql.startsWith('UPDATE fixed_events')) {
        const id = params?.[0] as string;
        const existing = eventsMap.get(id);
        if (existing) {
          return { rows: [existing], rowCount: 1 };
        }
        return { rows: [], rowCount: 0 };
      }
      if (sql.startsWith('DELETE FROM fixed_events WHERE id = $1')) {
        const id = params?.[0] as string;
        eventsMap.delete(id);
        return { rows: [], rowCount: 1 };
      }

      // 2. tasks queries
      if (sql.includes('FROM tasks') && sql.includes('id = $1') && sql.includes('user_id = $2')) {
        const id = params?.[0] as string;
        const t = tasksMap.get(id);
        return { rows: t ? [t] : [], rowCount: t ? 1 : 0 };
      }
      if (sql.includes('FROM tasks') && sql.includes('user_id = $1')) {
        return {
          rows: Array.from(tasksMap.values()),
          rowCount: tasksMap.size,
        };
      }
      if (sql.startsWith('INSERT INTO tasks')) {
        const [
          id,
          userId,
          title,
          dueAt,
          priority,
          difficulty,
          durationMinutes,
          isDone,
          createdAt,
          updatedAt,
        ] = params as [
          string,
          string,
          string,
          string,
          string,
          string,
          number,
          boolean,
          string,
          string,
        ];
        const row = {
          id,
          user_id: userId,
          title,
          due_at: dueAt,
          priority,
          difficulty,
          duration_minutes: durationMinutes,
          is_done: isDone,
          created_at: createdAt,
          updated_at: updatedAt,
        };
        tasksMap.set(id, row);
        return { rows: [row], rowCount: 1 };
      }
      if (sql.startsWith('UPDATE tasks')) {
        const id = params?.[0] as string;
        const existing = tasksMap.get(id);
        if (existing) {
          if (sql.includes('is_done =')) {
            const isDoneIdx = sql.indexOf('is_done = $');
            const paramNum = parseInt(sql.substring(isDoneIdx + 11, isDoneIdx + 13).trim(), 10);
            if (!isNaN(paramNum) && params) {
              existing.is_done = params[paramNum - 1];
            }
          }
          return { rows: [existing], rowCount: 1 };
        }
        return { rows: [], rowCount: 0 };
      }
      if (sql.startsWith('DELETE FROM tasks WHERE id = $1')) {
        const id = params?.[0] as string;
        tasksMap.delete(id);
        return { rows: [], rowCount: 1 };
      }
      if (sql.startsWith('DELETE FROM study_slots')) {
        return { rows: [], rowCount: 0 };
      }

      // 3. imported_files queries
      if (sql.startsWith('INSERT INTO imported_files')) {
        const [id] = params as [string];
        importedFilesMap.set(id, { id });
        return { rows: [{ id }], rowCount: 1 };
      }

      // 4. study_slots queries (for week schedule)
      if (sql.includes('FROM study_slots')) {
        return { rows: [], rowCount: 0 };
      }

      return { rows: [], rowCount: 0 };
    }),
  };

  const mockTx = vi.fn(async <T>(work: (client: PoolClient) => Promise<T>): Promise<T> => {
    return work(mockDb as unknown as PoolClient);
  });

  const eventRepo = new FixedEventRepository();
  const taskRepo = new TaskRepository();

  const eventsService = new FixedEventService(eventRepo, mockDb, mockTx);
  const calendarImportService = new CalendarImportService(
    eventRepo,
    new IcsParser(),
    new CsvParser(),
    mockDb,
    mockTx,
  );
  const tasksService = new TaskService(taskRepo, mockDb, mockTx);
  const scheduleService = new WeekScheduleService(eventRepo, taskRepo, mockDb);

  const app = createApp({
    eventsService,
    calendarImportService,
    tasksService,
    scheduleService,
  });

  beforeEach(() => {
    eventsMap.clear();
    tasksMap.clear();
    importedFilesMap.clear();
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // 1. /api/events API Tests
  // -------------------------------------------------------------------------
  describe('Endpoints /api/events', () => {
    it('trả về 401 UNAUTHORIZED khi không có thông tin xác thực', async () => {
      const res = await request(app).get('/api/events');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('trả về 400 VALIDATION_ERROR khi thiếu tham số query from hoặc to', async () => {
      const res = await request(app).get('/api/events').set('x-user-id', testUserId);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('tạo sự kiện cố định thành công trả về 201 CREATED', async () => {
      const res = await request(app).post('/api/events').set('x-user-id', testUserId).send({
        title: 'Nhập môn Công nghệ phần mềm',
        kind: 'class',
        startsAt: '2026-11-16T08:00:00.000Z',
        endsAt: '2026-11-16T10:00:00.000Z',
        location: 'Phòng C.42',
      });

      expect(res.status).toBe(201);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.title).toBe('Nhập môn Công nghệ phần mềm');
      expect(res.body.data.startsAt).toBe('2026-11-16T08:00:00.000Z');
      expect(res.body.data.endsAt).toBe('2026-11-16T10:00:00.000Z');
      expect(res.body.warnings).toBeUndefined();
    });

    it('tạo sự kiện bị trùng lịch trả về 201 kèm cảnh báo FIXED_EVENT_OVERLAP (BR-01)', async () => {
      // Giả lập đã có sẵn 1 sự kiện trùng trong findOverlapping
      vi.spyOn(eventRepo, 'findOverlapping').mockResolvedValueOnce([
        new FixedEvent({
          id: 'fe-conflict-1',
          userId: testUserId,
          title: 'Lớp học hiện có',
          kind: 'class',
          startsAt: new Date('2026-11-16T08:00:00.000Z'),
          endsAt: new Date('2026-11-16T10:00:00.000Z'),
          source: 'manual',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ]);

      const res = await request(app).post('/api/events').set('x-user-id', testUserId).send({
        title: 'Sự kiện trùng giờ',
        startsAt: '2026-11-16T09:00:00.000Z',
        endsAt: '2026-11-16T11:00:00.000Z',
      });

      expect(res.status).toBe(201);
      expect(res.body.warnings).toBeDefined();
      expect(res.body.warnings[0].code).toBe('FIXED_EVENT_OVERLAP');
    });

    it('xóa sự kiện cố định trả về 204 No Content', async () => {
      const eventId = '44444444-4444-4444-8444-444444444444';
      eventsMap.set(eventId, {
        id: eventId,
        user_id: testUserId,
        title: 'Sự kiện cần xóa',
        kind: 'class',
        starts_at: '2026-11-16T08:00:00.000Z',
        ends_at: '2026-11-16T10:00:00.000Z',
        source: 'manual',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const res = await request(app).delete(`/api/events/${eventId}`).set('x-user-id', testUserId);

      expect(res.status).toBe(204);
      expect(res.text).toBe('');
    });
  });

  // -------------------------------------------------------------------------
  // 2. /api/events/import Endpoints & Limits Tests
  // -------------------------------------------------------------------------
  describe('Endpoints /api/events/import/ics (BR-05 & BR-06)', () => {
    it('từ chối với 413 FILE_TOO_LARGE khi dung lượng tệp vượt quá 5 MB (BR-05)', async () => {
      const over5MB = Buffer.alloc(5 * 1024 * 1024 + 10, 'A');

      const res = await request(app)
        .post('/api/events/import/ics')
        .set('x-user-id', testUserId)
        .set('Content-Type', 'text/calendar')
        .set('x-filename', 'large_schedule.ics')
        .send(over5MB);

      expect(res.status).toBe(413);
      expect(res.body.error.code).toBe('FILE_TOO_LARGE');
    });

    it('từ chối với 422 FILE_INVALID khi tệp .ics sai định dạng cấu trúc (BR-06)', async () => {
      const invalidIcs = Buffer.from('INVALID CALENDAR DATA CONTENT', 'utf-8');

      const res = await request(app)
        .post('/api/events/import/ics')
        .set('x-user-id', testUserId)
        .set('Content-Type', 'text/calendar')
        .set('x-filename', 'corrupted.ics')
        .send(invalidIcs);

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('FILE_INVALID');
    });
  });

  // -------------------------------------------------------------------------
  // 3. /api/tasks API Tests
  // -------------------------------------------------------------------------
  describe('Endpoints /api/tasks (BR-04, BR-07, BR-08)', () => {
    it('tạo việc cần làm mới gán thời lượng mặc định 60 phút trả về 201 (BR-04)', async () => {
      const res = await request(app).post('/api/tasks').set('x-user-id', testUserId).send({
        title: 'Hoàn thành bài tập tuần 5',
        dueAt: '2026-11-30T17:00:00.000Z',
        // không gửi durationMinutes
      });

      expect(res.status).toBe(201);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.title).toBe('Hoàn thành bài tập tuần 5');
      expect(res.body.data.durationMinutes).toBe(60);
      expect(res.body.data.isDone).toBe(false);
      expect(res.body.warnings).toBeUndefined();
    });

    it('tạo việc có hạn chót trong quá khứ trả về cảnh báo DEADLINE_PASSED (BR-04)', async () => {
      const res = await request(app).post('/api/tasks').set('x-user-id', testUserId).send({
        title: 'Nộp báo cáo M3',
        dueAt: '2026-11-10T17:00:00.000Z', // trong quá khứ
      });

      expect(res.status).toBe(201);
      expect(res.body.warnings).toBeDefined();
      expect(res.body.warnings[0].code).toBe('DEADLINE_PASSED');
    });

    it('cập nhật việc đánh dấu hoàn thành isDone = true trả về 200', async () => {
      const taskId = '55555555-5555-4555-8555-555555555555';
      tasksMap.set(taskId, {
        id: taskId,
        user_id: testUserId,
        title: 'Làm bài tập lớn',
        due_at: '2026-11-28T17:00:00.000Z',
        priority: 'high',
        difficulty: 'medium',
        duration_minutes: 60,
        is_done: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const res = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .set('x-user-id', testUserId)
        .send({
          isDone: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(taskId);
    });

    it('xóa việc cần làm trả về 204 No Content', async () => {
      const taskId = '55555555-5555-4555-8555-555555555555';
      tasksMap.set(taskId, {
        id: taskId,
        user_id: testUserId,
        title: 'Việc cần xóa',
        due_at: '2026-11-28T17:00:00.000Z',
        priority: 'medium',
        difficulty: 'easy',
        duration_minutes: 60,
        is_done: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const res = await request(app).delete(`/api/tasks/${taskId}`).set('x-user-id', testUserId);

      expect(res.status).toBe(204);
      expect(res.text).toBe('');
    });
  });

  // -------------------------------------------------------------------------
  // 4. /api/schedule/week API Tests
  // -------------------------------------------------------------------------
  describe('Endpoint /api/schedule/week', () => {
    it('truy vấn lịch tuần tổng hợp trả về 200 với các danh mục fixedEvents, tasks, studySlots', async () => {
      const res = await request(app)
        .get('/api/schedule/week?weekStart=2026-11-16T00:00:00.000Z')
        .set('x-user-id', testUserId);

      expect(res.status).toBe(200);
      expect(res.body.data.weekStart).toBe('2026-11-16T00:00:00.000Z');
      expect(res.body.data.weekEnd).toBe('2026-11-23T00:00:00.000Z');
      expect(Array.isArray(res.body.data.fixedEvents)).toBe(true);
      expect(Array.isArray(res.body.data.tasks)).toBe(true);
      expect(Array.isArray(res.body.data.studySlots)).toBe(true);
    });
  });
});
