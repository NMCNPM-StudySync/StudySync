import { afterEach, describe, expect, it, vi } from 'vitest';
import { env } from '../src/config/env';

describe('Environment Configuration (src/config/env.ts)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('nạp đầy đủ các biến môi trường cấu hình bắt buộc ở môi trường test/dev', () => {
    expect(env).toBeDefined();
    expect(typeof env.port).toBe('number');
    expect(env.port).toBeGreaterThan(0);
    expect(typeof env.nodeEnv).toBe('string');
    expect(typeof env.databaseUrl).toBe('string');
    expect(typeof env.jwtSecret).toBe('string');
    expect(env.jwtSecret.length).toBeGreaterThan(0);
    expect(typeof env.jwtExpiresIn).toBe('string');
    expect(typeof env.corsOrigin).toBe('string');
    expect(typeof env.appTimezone).toBe('string');
    expect(typeof env.maxImportFileMb).toBe('number');
    expect(env.maxImportFileMb).toBeGreaterThan(0);
  });

  describe('Kiểm tra các nhánh ném ngoại lệ (Nhi Review)', () => {
    it('ném lỗi khi NODE_ENV không thuộc danh sách cho phép', async () => {
      vi.stubEnv('NODE_ENV', 'invalid-env');
      await expect(import('../src/config/env')).rejects.toThrow(/NODE_ENV không hợp lệ/);
    });

    it('ném lỗi khi PORT không phải số nguyên dương', async () => {
      vi.stubEnv('PORT', 'invalid-port');
      await expect(import('../src/config/env')).rejects.toThrow(/PORT không hợp lệ/);

      vi.resetModules();
      vi.stubEnv('PORT', '-1');
      await expect(import('../src/config/env')).rejects.toThrow(/PORT không hợp lệ/);
    });

    it('ném lỗi khi DATABASE_URL để trống ngoài môi trường test', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      vi.stubEnv('DATABASE_URL', '');
      await expect(import('../src/config/env')).rejects.toThrow(/DATABASE_URL không được để trống/);
    });

    it('ném lỗi khi JWT_SECRET để trống trong môi trường production', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/studysync');
      vi.stubEnv('CORS_ORIGIN', 'https://studysync.app');
      vi.stubEnv('JWT_SECRET', '');
      await expect(import('../src/config/env')).rejects.toThrow(/JWT_SECRET bắt buộc/);
    });

    it('ném lỗi khi JWT_SECRET chứa ký tự mẫu <> trong môi trường production', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/studysync');
      vi.stubEnv('CORS_ORIGIN', 'https://studysync.app');
      vi.stubEnv('JWT_SECRET', '<chuoi_ngau_nhien_dai_it_nhat_32_ky_tu>');
      await expect(import('../src/config/env')).rejects.toThrow(/không được chứa ký tự mẫu/);
    });

    it('ném lỗi khi JWT_SECRET ngắn hơn 32 ký tự trong môi trường production', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/studysync');
      vi.stubEnv('CORS_ORIGIN', 'https://studysync.app');
      vi.stubEnv('JWT_SECRET', 'too-short-secret');
      await expect(import('../src/config/env')).rejects.toThrow(/độ dài tối thiểu 32 ký tự/);
    });

    it('ném lỗi khi CORS_ORIGIN thiếu hoặc bằng * trong môi trường production', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/studysync');
      vi.stubEnv('JWT_SECRET', 'very-long-production-jwt-secret-key-32-chars-ok!');
      vi.stubEnv('CORS_ORIGIN', '*');
      await expect(import('../src/config/env')).rejects.toThrow(
        /CORS_ORIGIN bắt buộc phải được cấu hình cụ thể/,
      );
    });

    it('ném lỗi khi MAX_IMPORT_FILE_MB không hợp lệ hoặc <= 0', async () => {
      vi.stubEnv('MAX_IMPORT_FILE_MB', 'abc');
      await expect(import('../src/config/env')).rejects.toThrow(/MAX_IMPORT_FILE_MB không hợp lệ/);

      vi.resetModules();
      vi.stubEnv('MAX_IMPORT_FILE_MB', '0');
      await expect(import('../src/config/env')).rejects.toThrow(/MAX_IMPORT_FILE_MB không hợp lệ/);
    });
  });
});
