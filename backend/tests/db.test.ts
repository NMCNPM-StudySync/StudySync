import { describe, expect, it } from 'vitest';
import { closePool, pool, query } from '../src/config/db';
import { env } from '../src/config/env';

describe('Database Configuration & Pool', () => {
  it('đọc cấu hình databaseUrl từ env', () => {
    expect(env.databaseUrl).toBeDefined();
    expect(typeof env.databaseUrl).toBe('string');
    expect(env.databaseUrl).toContain('postgresql://');
  });

  it('đọc cấu hình directUrl từ env hoặc fallback sang databaseUrl', () => {
    expect(env.directUrl).toBeDefined();
    expect(typeof env.directUrl).toBe('string');
    expect(env.directUrl).toContain('postgresql://');
  });

  it('khởi tạo pool với các phương thức cốt lõi', () => {
    expect(pool).toBeDefined();
    expect(typeof pool.query).toBe('function');
    expect(typeof pool.connect).toBe('function');
    expect(typeof pool.end).toBe('function');
  });

  it('cung cấp hàm query và closePool dùng chung', () => {
    expect(typeof query).toBe('function');
    expect(typeof closePool).toBe('function');
  });
});
