import { describe, expect, it } from 'vitest';
import { closePool, createPoolConfig, pool, query } from '../src/config/db';
import { env, readDirectUrl } from '../src/config/env';

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

describe('readDirectUrl()', () => {
  it('ưu tiên trả về DIRECT_URL khi được khai báo', () => {
    const result = readDirectUrl({
      DIRECT_URL: 'postgresql://postgres:pass@db.example.supabase.co:5432/postgres',
      DATABASE_URL:
        'postgresql://postgres.example:pass@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
    });
    expect(result).toBe('postgresql://postgres:pass@db.example.supabase.co:5432/postgres');
  });

  it('fallback về DATABASE_URL khi DIRECT_URL để trống hoặc không tồn tại', () => {
    const resultWithEmpty = readDirectUrl({
      DIRECT_URL: '   ',
      DATABASE_URL: 'postgresql://postgres:pass@localhost:5432/studysync',
    });
    expect(resultWithEmpty).toBe('postgresql://postgres:pass@localhost:5432/studysync');

    const resultWithUndefined = readDirectUrl({
      DATABASE_URL: 'postgresql://postgres:pass@localhost:5432/studysync',
    });
    expect(resultWithUndefined).toBe('postgresql://postgres:pass@localhost:5432/studysync');
  });
});

describe('createPoolConfig()', () => {
  it('trả về cấu hình không SSL cho localhost', () => {
    const config = createPoolConfig('postgresql://postgres:postgres@localhost:5432/studysync');
    expect(config.ssl).toBeUndefined();
    expect(config.connectionString).toBe('postgresql://postgres:postgres@localhost:5432/studysync');
  });

  it('trả về cấu hình không SSL cho 127.0.0.1', () => {
    const config = createPoolConfig('postgresql://postgres:postgres@127.0.0.1:5432/studysync');
    expect(config.ssl).toBeUndefined();
    expect(config.connectionString).toBe('postgresql://postgres:postgres@127.0.0.1:5432/studysync');
  });

  it('bật SSL và loại bỏ ?sslmode=require duy nhất cho cloud database', () => {
    const input =
      'postgresql://postgres:pass@db.test-project-ref.supabase.co:5432/postgres?sslmode=require';
    const config = createPoolConfig(input);

    expect(config.ssl).toEqual({ rejectUnauthorized: false });
    expect(config.connectionTimeoutMillis).toBe(5000);
    expect(config.connectionString).toBe(
      'postgresql://postgres:pass@db.test-project-ref.supabase.co:5432/postgres',
    );
    expect(config.connectionString).not.toContain('sslmode');
  });

  it('bật SSL và giữ lại các tham số query khác khi sslmode ở đầu query string', () => {
    const input =
      'postgresql://postgres.ref:pass@aws-1.pooler.supabase.com:6543/postgres?sslmode=require&uselibpqcompat=true';
    const config = createPoolConfig(input);

    expect(config.ssl).toEqual({ rejectUnauthorized: false });
    expect(config.connectionString).toBe(
      'postgresql://postgres.ref:pass@aws-1.pooler.supabase.com:6543/postgres?uselibpqcompat=true',
    );
  });

  it('bật SSL và giữ lại các tham số query khác khi sslmode ở cuối query string', () => {
    const input =
      'postgresql://postgres.ref:pass@aws-1.pooler.supabase.com:6543/postgres?uselibpqcompat=true&sslmode=require';
    const config = createPoolConfig(input);

    expect(config.ssl).toEqual({ rejectUnauthorized: false });
    expect(config.connectionString).toBe(
      'postgresql://postgres.ref:pass@aws-1.pooler.supabase.com:6543/postgres?uselibpqcompat=true',
    );
  });

  it('bật SSL cho cloud database ngay cả khi không có tham số sslmode', () => {
    const input = 'postgresql://postgres.ref:pass@aws-1.pooler.supabase.com:6543/postgres';
    const config = createPoolConfig(input);

    expect(config.ssl).toEqual({ rejectUnauthorized: false });
    expect(config.connectionString).toBe(input);
  });

  it('nhận diện chính xác cloud database khi mật khẩu có chứa từ "localhost"', () => {
    const input = 'postgresql://postgres:secret_localhost_pass@db.ref.supabase.co:5432/postgres';
    const config = createPoolConfig(input);

    expect(config.ssl).toEqual({ rejectUnauthorized: false });
    expect(config.connectionString).toBe(input);
  });
});
