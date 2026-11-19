import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app';
import * as db from '../src/config/db';

describe('GET /health', () => {
  it('trả về status ok và database connected khi kết nối CSDL thành công', async () => {
    vi.spyOn(db, 'testConnection').mockResolvedValueOnce(true);

    const res = await request(createApp()).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBe('connected');
    expect(res.body.time).toBeDefined();
  });

  it('trả về status 503 và database disconnected khi kết nối CSDL thất bại', async () => {
    vi.spyOn(db, 'testConnection').mockRejectedValueOnce(new Error('Connection timeout'));

    const res = await request(createApp()).get('/health');

    expect(res.status).toBe(503);
    expect(res.body.status).toBe('error');
    expect(res.body.database).toBe('disconnected');
    expect(res.body.error).toBe('Connection timeout');
  });
});
