import type { User } from '../types/auth';

const TOKEN_KEY = 'studysync_token';
const EXPIRY_KEY = 'studysync_token_expiry';
const USER_KEY = 'studysync_user';

export function isTokenExpired(expiresAt?: string | null): boolean {
  if (!expiresAt) {
    return true;
  }
  const expiryTime = new Date(expiresAt).getTime();
  if (Number.isNaN(expiryTime)) {
    return true;
  }
  return expiryTime <= Date.now();
}

export const tokenStorage = {
  getToken(): string | null {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const expiresAt = localStorage.getItem(EXPIRY_KEY);
      if (!token) {
        return null;
      }
      if (isTokenExpired(expiresAt)) {
        this.clearAuth();
        return null;
      }
      return token;
    } catch {
      return null;
    }
  },

  getRawToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  getExpiresAt(): string | null {
    try {
      return localStorage.getItem(EXPIRY_KEY);
    } catch {
      return null;
    }
  },

  getUser(): User | null {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      if (!userStr) {
        return null;
      }
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  setAuth(token: string, user: User, expiresAt: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(EXPIRY_KEY, expiresAt);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      // Bỏ qua nếu localStorage bị chặn hoặc hết dung lượng
    }
  },

  clearAuth(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(EXPIRY_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // Bỏ qua lỗi storage khi dọn dẹp
    }
  },
};
