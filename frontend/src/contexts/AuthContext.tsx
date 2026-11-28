import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { SESSION_EXPIRED_EVENT, apiClient } from '../services/apiClient';
import { tokenStorage } from '../services/tokenStorage';
import type { AuthResponseData, LoginRequest, RegisterRequest, User } from '../types/auth';
import { AuthContext, type AuthContextType } from './authContextDef';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Khôi phục trạng thái xác thực từ tokenStorage khi ứng dụng khởi chạy
  useEffect(() => {
    try {
      const storedToken = tokenStorage.getToken();
      if (storedToken) {
        const storedUser = tokenStorage.getUser();
        setToken(storedToken);
        setUser(storedUser);
      } else {
        setToken(null);
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Phiên hết hạn (refresh thất bại): dọn state để ProtectedRoute chuyển về /login
  useEffect(() => {
    const handleExpired = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
  }, []);

  const login = useCallback(async (credentials: LoginRequest): Promise<AuthResponseData> => {
    const res = await apiClient.post<AuthResponseData>('/auth/login', credentials, {
      skipAuth: true,
    });
    const authData = res.data;
    tokenStorage.setAuth(authData.token, authData.user, authData.expiresAt);
    setToken(authData.token);
    setUser(authData.user);
    return authData;
  }, []);

  const register = useCallback(async (payload: RegisterRequest): Promise<AuthResponseData> => {
    const res = await apiClient.post<AuthResponseData>('/auth/register', payload, {
      skipAuth: true,
    });
    const authData = res.data;
    tokenStorage.setAuth(authData.token, authData.user, authData.expiresAt);
    setToken(authData.token);
    setUser(authData.user);
    return authData;
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clearAuth();
    setToken(null);
    setUser(null);
  }, []);

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isLoading,
      login,
      register,
      logout,
    }),
    [user, token, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
