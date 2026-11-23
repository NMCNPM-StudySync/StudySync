import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app';
import { StatsRepository } from '../src/modules/stats/stats.repository';
import { StatsService } from '../src/modules/stats/stats.service';
import type { Queryable } from '../src/shared/base-repository';

describe('Stats API (/api/statistics/weekly) - TV5', () => {
  const userId = '0b8f6f5e-2c1a-4c7e-9d4b-3a5f1e7c9a10';
  const authHeader = `Bearer ${userId}`;

  const mockRepo = new StatsRepository();
  const mockDb: Queryable = { query: vi.fn() };
  const statsService = new StatsService(mockRepo, mockDb);
  const app = createApp({ statsService });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('trả về 401 UNAUTHORIZED khi thiếu token', async () => {
    const res = await request(app).get('/api/statistics/weekly');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('trả về 200 OK với dữ liệu tuần hiện tại khi không truyền from/to', async () => {
    vi.spyOn(mockRepo, 'getWeeklyStats').mockResolvedValue({
      totalMinutes: 150,
      days: [
        { date: '2026-11-09', dayOfWeek: 1, minutes: 60 },
        { date: '2026-11-10', dayOfWeek: 2, minutes: 90 },
      ],
    });

    const res = await request(app).get('/api/statistics/weekly').set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.totalMinutes).toBe(150);
    expect(res.body.data.days).toHaveLength(7);
  });

  it('trả về 200 OK khi truyền mốc from và to tuần quá khứ hợp lệ', async () => {
    vi.spyOn(mockRepo, 'getWeeklyStats').mockResolvedValue({
      totalMinutes: 300,
      days: [],
    });

    const from = '2026-11-01T17:00:00.000Z';
    const to = '2026-11-08T17:00:00.000Z';

    const res = await request(app)
      .get(`/api/statistics/weekly?from=${from}&to=${to}`)
      .set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(res.body.data.from).toBe(from);
    expect(res.body.data.to).toBe(to);
    expect(res.body.data.totalMinutes).toBe(300);
    expect(res.body.data.days).toHaveLength(7);
  });

  it('TC-137: trả về 400 VALIDATION_ERROR khi chỉ truyền from mà thiếu to', async () => {
    const from = '2026-11-01T17:00:00.000Z';
    const res = await request(app)
      .get(`/api/statistics/weekly?from=${from}`)
      .set('Authorization', authHeader);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('TC-137: trả về 400 VALIDATION_ERROR khi chuỗi thời gian có offset +07:00', async () => {
    const res = await request(app)
      .get('/api/statistics/weekly?from=2026-11-02T00:00:00+07:00&to=2026-11-09T00:00:00+07:00')
      .set('Authorization', authHeader);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('TC-137: trả về 400 VALIDATION_ERROR khi yêu cầu xem tuần tương lai', async () => {
    const futureFrom = '2030-11-03T17:00:00.000Z';
    const futureTo = '2030-11-10T17:00:00.000Z';

    const res = await request(app)
      .get(`/api/statistics/weekly?from=${futureFrom}&to=${futureTo}`)
      .set('Authorization', authHeader);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.message).toContain('tương lai');
  });
});
