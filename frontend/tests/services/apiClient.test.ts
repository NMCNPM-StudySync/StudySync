import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiClient } from '../../src/services/apiClient';
import { tokenStorage } from '../../src/services/tokenStorage';

describe('apiClient', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    localStorage.clear();
  });

  it('lấy đúng base URL từ cấu hình', () => {
    const baseUrl = apiClient.getBaseUrl();
    expect(baseUrl).toBe('http://localhost:3000/api');
  });

  it('tự động gắn header Authorization: Bearer <token> khi đã đăng nhập', async () => {
    const futureExpiry = new Date(Date.now() + 3600 * 1000).toISOString();
    tokenStorage.setAuth(
      'token-test-xyz',
      { id: '1', email: 'a@b.com', displayName: 'A' },
      futureExpiry,
    );

    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { message: 'success' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    global.fetch = mockFetch;

    await apiClient.get('/test-endpoint');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const call0 = mockFetch.mock.calls[0];
    expect(call0).toBeDefined();
    const init = call0![1] as RequestInit;
    const headers = init.headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer token-test-xyz');
    expect(headers.get('Accept')).toBe('application/json');
  });

  it('không gắn header Authorization khi bật skipAuth: true', async () => {
    const futureExpiry = new Date(Date.now() + 3600 * 1000).toISOString();
    tokenStorage.setAuth(
      'token-test-xyz',
      { id: '1', email: 'a@b.com', displayName: 'A' },
      futureExpiry,
    );

    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { ok: true } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    global.fetch = mockFetch;

    await apiClient.get('/public-endpoint', { skipAuth: true });

    const callSkip = mockFetch.mock.calls[0];
    expect(callSkip).toBeDefined();
    const initSkip = callSkip![1] as RequestInit;
    const headers = initSkip.headers as Headers;
    expect(headers.get('Authorization')).toBeNull();
  });

  it('xử lý query parameters đúng định dạng', async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    global.fetch = mockFetch;

    await apiClient.get('/items', {
      params: { page: 1, filter: 'active', unused: undefined },
    });

    const callParams = mockFetch.mock.calls[0];
    expect(callParams).toBeDefined();
    const url = callParams![0];
    expect(url).toBe('http://localhost:3000/api/items?page=1&filter=active');
  });

  it('bóc tách đúng định dạng response chuẩn { data, warnings }', async () => {
    const mockPayload = {
      data: { id: 'item-1', title: 'Task 1' },
      warnings: [{ code: 'DEADLINE_PASSED', message: 'Hạn đã qua' }],
    };

    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(mockPayload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const res = await apiClient.get<{ id: string; title: string }>('/tasks/1');
    expect(res.data).toEqual({ id: 'item-1', title: 'Task 1' });
    expect(res.warnings).toHaveLength(1);
    expect(res.warnings?.[0]?.code).toBe('DEADLINE_PASSED');
  });

  it('xử lý an toàn phản hồi HTTP 204 No Content', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 204,
      }),
    );

    const res = await apiClient.delete('/items/1');
    expect(res.data).toBeNull();
    expect(res.warnings).toEqual([]);
  });

  it('parse lỗi chuẩn backend thành ApiError với đầy đủ status, code và details', async () => {
    const errorPayload = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dữ liệu không hợp lệ',
        details: [{ field: 'email', issue: 'Email không đúng định dạng' }],
      },
    };

    const createMockResponse = () =>
      new Response(JSON.stringify(errorPayload), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });

    global.fetch = vi.fn().mockImplementation(() => Promise.resolve(createMockResponse()));

    await expect(apiClient.post('/auth/register', {})).rejects.toThrow(ApiError);

    try {
      await apiClient.post('/auth/register', {});
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(400);
      expect(apiErr.code).toBe('VALIDATION_ERROR');
      expect(apiErr.message).toBe('Dữ liệu không hợp lệ');
      expect(apiErr.details).toHaveLength(1);
      expect(apiErr.isValidationError).toBe(true);
      expect(apiErr.isUnauthorized).toBe(false);
    }
  });

  it('xử lý đúng lỗi 401 UNAUTHORIZED và các thuộc tính getter', async () => {
    const errorPayload = {
      error: {
        code: 'UNAUTHORIZED',
        message: 'Chưa đăng nhập hoặc token hết hạn',
      },
    };

    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(errorPayload), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    try {
      await apiClient.get('/protected-data');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(401);
      expect(apiErr.code).toBe('UNAUTHORIZED');
      expect(apiErr.isUnauthorized).toBe(true);
    }
  });

  it('chuyển đổi lỗi mạng fetch thành ApiError với mã NETWORK_ERROR', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

    try {
      await apiClient.get('/anywhere');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(0);
      expect(apiErr.code).toBe('NETWORK_ERROR');
      expect(apiErr.message).toBe('Failed to fetch');
    }
  });

  it('hỗ trợ đầy đủ các phương thức HTTP: post, put, patch, delete', async () => {
    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ data: { success: true } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );
    global.fetch = mockFetch;

    await apiClient.post('/items', { name: 'Item 1' });
    const calls = mockFetch.mock.calls;
    expect(calls[0]?.[1]?.method).toBe('POST');
    expect(calls[0]?.[1]?.body).toBe(JSON.stringify({ name: 'Item 1' }));

    await apiClient.put('/items/1', { name: 'Item Updated' });
    expect(calls[1]?.[1]?.method).toBe('PUT');

    await apiClient.patch('/items/1', { name: 'Item Patched' });
    expect(calls[2]?.[1]?.method).toBe('PATCH');

    await apiClient.delete('/items/1');
    expect(calls[3]?.[1]?.method).toBe('DELETE');
  });
});
