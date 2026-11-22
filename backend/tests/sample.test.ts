import request from 'supertest';
import type { PoolClient } from 'pg';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app';
import { SampleRepository } from '../src/modules/sample/sample.repository';
import { SampleService } from '../src/modules/sample/sample.service';
import type { Queryable } from '../src/shared/base-repository';

describe('Sample Slice End-to-End API (/api/sample)', () => {
  const rows = new Map<string, Record<string, unknown>>();

  const mockDb: Queryable = {
    query: vi.fn(async (text: string, params?: unknown[]) => {
      if (text.includes('WHERE id = $1')) {
        const id = params?.[0] as string;
        const row = rows.get(id);
        return { rows: row ? [row] : [], rowCount: row ? 1 : 0 };
      }
      if (text.startsWith('SELECT * FROM samples')) {
        return {
          rows: Array.from(rows.values()),
          rowCount: rows.size,
        };
      }
      if (text.startsWith('INSERT INTO samples')) {
        const [id, title, description, createdAt, updatedAt] = params as [
          string,
          string,
          string | null,
          Date,
          Date,
        ];
        const row = {
          id,
          title,
          description,
          created_at: createdAt,
          updated_at: updatedAt,
        };
        rows.set(id, row);
        return { rows: [row], rowCount: 1 };
      }
      if (text.startsWith('DELETE FROM samples')) {
        const id = params?.[0] as string;
        rows.delete(id);
        return { rows: [], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }),
  };

  const mockTx = vi.fn(async <T>(work: (client: PoolClient) => Promise<T>): Promise<T> => {
    return work(mockDb as unknown as PoolClient);
  });

  const sampleService = new SampleService(new SampleRepository(), mockDb, mockTx);
  const app = createApp({ sampleService });

  beforeEach(() => {
    rows.clear();
    vi.clearAllMocks();
  });

  it('OPTIONS trả về 204 với tiêu đề CORS', async () => {
    const res = await request(app).options('/api/sample');
    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });

  it('POST /api/sample tạo thành công đi qua Repository và Transaction trả về 201 với format { data }', async () => {
    const res = await request(app).post('/api/sample').send({
      title: 'Mẫu thiết kế Clean Architecture',
      description: 'Lát cắt mẫu kiểm chứng 4 tầng',
    });

    expect(res.status).toBe(201);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.title).toBe('Mẫu thiết kế Clean Architecture');
    expect(res.body.data.description).toBe('Lát cắt mẫu kiểm chứng 4 tầng');
    expect(res.body.data.id).toBeDefined();
    expect(res.body.warnings).toBeUndefined();

    // Verify transaction and repository were actually called
    expect(mockTx).toHaveBeenCalledTimes(1);
    expect(mockDb.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO samples'),
      expect.any(Array),
    );
  });

  it('POST /api/sample thành công kèm cảnh báo trả về 201 với { data, warnings }', async () => {
    const res = await request(app).post('/api/sample').send({
      title: 'Mẫu có cảnh báo',
      withWarning: true,
    });

    expect(res.status).toBe(201);
    expect(res.body.data).toBeDefined();
    expect(res.body.warnings).toBeDefined();
    expect(res.body.warnings[0].code).toBe('SAMPLE_WARNING');
  });

  it('POST /api/sample thiếu tiêu đề hoặc rỗng trả về 400 VALIDATION_ERROR', async () => {
    const res = await request(app).post('/api/sample').send({
      title: '',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toBeDefined();
  });

  it('POST /api/sample với dữ liệu sai kiểu trả về 400 VALIDATION_ERROR (Nhi Review #2)', async () => {
    // 1. title là số
    const resNumberTitle = await request(app).post('/api/sample').send({
      title: 123,
    });
    expect(resNumberTitle.status).toBe(400);
    expect(resNumberTitle.body.error.code).toBe('VALIDATION_ERROR');
    expect(resNumberTitle.body.error.details[0].field).toBe('title');

    // 2. title là mảng
    const resArrayTitle = await request(app)
      .post('/api/sample')
      .send({
        title: ['x'],
      });
    expect(resArrayTitle.status).toBe(400);
    expect(resArrayTitle.body.error.code).toBe('VALIDATION_ERROR');

    // 3. description là số
    const resNumberDesc = await request(app).post('/api/sample').send({
      title: 'Hợp lệ',
      description: 5,
    });
    expect(resNumberDesc.status).toBe(400);
    expect(resNumberDesc.body.error.code).toBe('VALIDATION_ERROR');
    expect(resNumberDesc.body.error.details[0].field).toBe('description');

    // 4. withWarning không phải boolean
    const resBadWarning = await request(app).post('/api/sample').send({
      title: 'Hợp lệ',
      withWarning: 'true',
    });
    expect(resBadWarning.status).toBe(400);
    expect(resBadWarning.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/sample gọi Repository findAll và trả về danh sách mảng trong data', async () => {
    const res = await request(app).get('/api/sample');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(mockDb.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM samples ORDER BY created_at DESC'),
    );
  });

  it('GET /api/sample/:id trả về chi tiết đối tượng', async () => {
    const created = await request(app).post('/api/sample').send({
      title: 'Kiểm tra chi tiết',
    });

    const id = created.body.data.id;
    const res = await request(app).get(`/api/sample/${id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(id);
    expect(res.body.data.title).toBe('Kiểm tra chi tiết');
  });

  it('GET /api/sample/:id với id không tồn tại trả về 404 NOT_FOUND', async () => {
    const res = await request(app).get('/api/sample/id-khong-ton-tai');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('DELETE /api/sample/:id xóa thành công trả về HTTP 204 body rỗng', async () => {
    const created = await request(app).post('/api/sample').send({
      title: 'Xóa mục này',
    });

    const id = created.body.data.id;
    const res = await request(app).delete(`/api/sample/${id}`);

    expect(res.status).toBe(204);
    expect(res.text).toBe('');
    expect(res.body).toEqual({});
  });

  it('DELETE /api/sample/:id với id không tồn tại trả về 404 NOT_FOUND', async () => {
    const res = await request(app).delete('/api/sample/id-khong-ton-tai');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
