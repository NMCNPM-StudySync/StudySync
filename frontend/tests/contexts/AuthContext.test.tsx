import { act, render, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from '../../src/contexts';
import { apiClient } from '../../src/services/apiClient';
import { tokenStorage } from '../../src/services/tokenStorage';
import type { AuthResponseData, User } from '../../src/types/auth';

describe('AuthContext & useAuth', () => {
  const mockUser: User = {
    id: 'user-001',
    email: 'kientrung@example.com',
    displayName: 'Nguyễn Đình Trung Kiên',
  };

  const mockAuthData: AuthResponseData = {
    token: 'jwt-auth-token-999',
    expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    user: mockUser,
  };

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('ném lỗi khi useAuth được gọi bên ngoài AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth phải được sử dụng bên trong AuthProvider',
    );
  });

  it('khởi tạo trạng thái chưa đăng nhập khi tokenStorage trống', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it('tự động khôi phục phiên đăng nhập khi có token hợp lệ trong storage', () => {
    tokenStorage.setAuth(mockAuthData.token, mockAuthData.user, mockAuthData.expiresAt);

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe(mockAuthData.token);
    expect(result.current.user).toEqual(mockUser);
  });

  it('login() gọi API thành công, cập nhật state và lưu vào storage', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: mockAuthData,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await act(async () => {
      await result.current.login({
        email: 'kientrung@example.com',
        password: 'password123',
      });
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      '/auth/login',
      { email: 'kientrung@example.com', password: 'password123' },
      { skipAuth: true },
    );

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe(mockAuthData.token);
    expect(result.current.user).toEqual(mockUser);

    expect(tokenStorage.getToken()).toBe(mockAuthData.token);
    expect(tokenStorage.getUser()).toEqual(mockUser);
  });

  it('register() gọi API thành công, cập nhật state và lưu vào storage', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: mockAuthData,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await act(async () => {
      await result.current.register({
        displayName: 'Nguyễn Đình Trung Kiên',
        email: 'kientrung@example.com',
        password: 'password123',
      });
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      '/auth/register',
      {
        displayName: 'Nguyễn Đình Trung Kiên',
        email: 'kientrung@example.com',
        password: 'password123',
      },
      { skipAuth: true },
    );

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe(mockAuthData.token);
    expect(result.current.user).toEqual(mockUser);
  });

  it('logout() xóa sạch state và dữ liệu trong tokenStorage', () => {
    tokenStorage.setAuth(mockAuthData.token, mockAuthData.user, mockAuthData.expiresAt);

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();

    expect(tokenStorage.getToken()).toBeNull();
    expect(tokenStorage.getUser()).toBeNull();
  });

  it('AuthProvider render nội dung con một cách bình thường', () => {
    render(
      <AuthProvider>
        <div data-testid="child-content">Nội dung ứng dụng</div>
      </AuthProvider>,
    );

    expect(screen.getByTestId('child-content')).toHaveTextContent('Nội dung ứng dụng');
  });
});
