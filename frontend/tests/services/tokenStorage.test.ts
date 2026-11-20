import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { isTokenExpired, tokenStorage } from '../../src/services/tokenStorage';
import type { User } from '../../src/types/auth';

describe('tokenStorage', () => {
  const mockUser: User = {
    id: 'user-123',
    email: 'an.nguyen@example.com',
    displayName: 'Nguyễn Văn An',
  };

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('trả về null khi chưa có token nào trong storage', () => {
    expect(tokenStorage.getToken()).toBeNull();
    expect(tokenStorage.getUser()).toBeNull();
    expect(tokenStorage.getExpiresAt()).toBeNull();
  });

  it('lưu trữ và đọc thông tin xác thực thành công', () => {
    const futureExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    tokenStorage.setAuth('jwt-valid-token-123', mockUser, futureExpiry);

    expect(tokenStorage.getToken()).toBe('jwt-valid-token-123');
    expect(tokenStorage.getUser()).toEqual(mockUser);
    expect(tokenStorage.getExpiresAt()).toBe(futureExpiry);
  });

  it('tự động dọn dẹp storage và trả về null khi token đã hết hạn', () => {
    const pastExpiry = new Date(Date.now() - 1000).toISOString();
    tokenStorage.setAuth('jwt-expired-token', mockUser, pastExpiry);

    expect(tokenStorage.getToken()).toBeNull();
    expect(tokenStorage.getUser()).toBeNull();
    expect(tokenStorage.getRawToken()).toBeNull();
  });

  it('xóa sạch toàn bộ thông tin xác thực khi gọi clearAuth()', () => {
    const futureExpiry = new Date(Date.now() + 3600 * 1000).toISOString();
    tokenStorage.setAuth('jwt-sample-token', mockUser, futureExpiry);

    tokenStorage.clearAuth();

    expect(tokenStorage.getToken()).toBeNull();
    expect(tokenStorage.getUser()).toBeNull();
    expect(tokenStorage.getExpiresAt()).toBeNull();
  });

  describe('isTokenExpired', () => {
    it('trả về true nếu không truyền expiresAt hoặc chuỗi rỗng', () => {
      expect(isTokenExpired(undefined)).toBe(true);
      expect(isTokenExpired(null)).toBe(true);
      expect(isTokenExpired('')).toBe(true);
      expect(isTokenExpired('invalid-date-string')).toBe(true);
    });

    it('trả về true nếu thời điểm hết hạn nhỏ hơn hoặc bằng hiện tại', () => {
      const past = new Date(Date.now() - 10000).toISOString();
      expect(isTokenExpired(past)).toBe(true);
    });

    it('trả về false nếu thời điểm hết hạn còn trong tương lai', () => {
      const future = new Date(Date.now() + 60000).toISOString();
      expect(isTokenExpired(future)).toBe(false);
    });
  });
});
