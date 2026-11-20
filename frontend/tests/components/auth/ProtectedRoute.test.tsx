import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ProtectedRoute } from '../../../src/components/auth/ProtectedRoute';
import { AuthProvider } from '../../../src/contexts/AuthContext';
import { tokenStorage } from '../../../src/services/tokenStorage';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('chuyển hướng người dùng chưa đăng nhập về trang /login', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/login" element={<div>Trang đăng nhập</div>} />
            <Route element={<ProtectedRoute />}>
              <Route path="/protected" element={<div>Nội dung bí mật</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(screen.getByText('Trang đăng nhập')).toBeInTheDocument();
    expect(screen.queryByText('Nội dung bí mật')).not.toBeInTheDocument();
  });

  it('cho phép truy cập nội dung khi người dùng đã đăng nhập hợp lệ', () => {
    const futureExpiry = new Date(Date.now() + 3600 * 1000).toISOString();
    tokenStorage.setAuth(
      'valid-token',
      { id: '1', email: 'user@test.com', displayName: 'User' },
      futureExpiry,
    );

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/login" element={<div>Trang đăng nhập</div>} />
            <Route element={<ProtectedRoute />}>
              <Route path="/protected" element={<div>Nội dung bí mật</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(screen.getByText('Nội dung bí mật')).toBeInTheDocument();
    expect(screen.queryByText('Trang đăng nhập')).not.toBeInTheDocument();
  });

  it('hỗ trợ truyền children trực tiếp vào ProtectedRoute', () => {
    const futureExpiry = new Date(Date.now() + 3600 * 1000).toISOString();
    tokenStorage.setAuth(
      'valid-token',
      { id: '1', email: 'user@test.com', displayName: 'User' },
      futureExpiry,
    );

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>Nội dung con trực tiếp</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(screen.getByText('Nội dung con trực tiếp')).toBeInTheDocument();
  });
});
