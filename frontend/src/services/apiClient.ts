import type { ApiErrorDetail, ApiResponse, ApiWarning } from '../types/api';
import { tokenStorage } from './tokenStorage';

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: ApiErrorDetail[];

  constructor(
    message: string,
    status: number,
    code: string = 'UNKNOWN_ERROR',
    details?: ApiErrorDetail[],
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  get isUnauthorized(): boolean {
    return this.status === 401 || this.code === 'UNAUTHORIZED';
  }

  get isForbidden(): boolean {
    return this.status === 403 || this.code === 'FORBIDDEN';
  }

  get isNotFound(): boolean {
    return this.status === 404 || this.code === 'NOT_FOUND';
  }

  get isValidationError(): boolean {
    return this.status === 400 || this.code === 'VALIDATION_ERROR';
  }

  get isConflict(): boolean {
    return this.status === 409 || this.code === 'CONFLICT';
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
}

function resolveBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL as string | undefined;
  const rawUrl = envUrl && envUrl.trim() !== '' ? envUrl.trim() : 'http://localhost:3000/api';
  return rawUrl.replace(/\/+$/, '');
}

function buildUrl(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined | null>,
): string {
  const baseUrl = resolveBaseUrl();
  let fullUrl: string;

  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    fullUrl = endpoint;
  } else {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    fullUrl = `${baseUrl}${cleanEndpoint}`;
  }

  if (params && Object.keys(params).length > 0) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        query.append(key, String(value));
      }
    }
    const queryString = query.toString();
    if (queryString) {
      fullUrl += fullUrl.includes('?') ? `&${queryString}` : `?${queryString}`;
    }
  }

  return fullUrl;
}

export const apiClient = {
  getBaseUrl(): string {
    return resolveBaseUrl();
  },

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { body, params, skipAuth = false, headers: customHeaders, ...customInit } = options;
    const url = buildUrl(endpoint, params);

    const headers = new Headers(customHeaders);

    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json');
    }

    if (!skipAuth && !headers.has('Authorization')) {
      const token = tokenStorage.getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    let serializedBody: BodyInit | undefined;
    if (body !== undefined && body !== null) {
      if (
        typeof body === 'string' ||
        body instanceof FormData ||
        body instanceof Blob ||
        body instanceof URLSearchParams
      ) {
        serializedBody = body;
      } else {
        if (!headers.has('Content-Type')) {
          headers.set('Content-Type', 'application/json');
        }
        serializedBody = JSON.stringify(body);
      }
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...customInit,
        headers,
        body: serializedBody,
      });
    } catch (networkErr: unknown) {
      if (networkErr instanceof ApiError) {
        throw networkErr;
      }
      const message =
        networkErr instanceof Error ? networkErr.message : 'Không thể kết nối đến máy chủ';
      throw new ApiError(message, 0, 'NETWORK_ERROR');
    }

    // Xử lý HTTP 204 No Content
    if (response.status === 204) {
      return {
        data: null as unknown as T,
        warnings: [],
      };
    }

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    if (response.ok) {
      if (isJson) {
        const payload = (await response.json()) as {
          data?: T;
          warnings?: ApiWarning[];
        };
        if (payload && typeof payload === 'object' && 'data' in payload) {
          return {
            data: payload.data as T,
            warnings: payload.warnings || [],
          };
        }
        return {
          data: payload as unknown as T,
          warnings: [],
        };
      }
      const textData = (await response.text()) as unknown as T;
      return {
        data: textData,
        warnings: [],
      };
    }

    // Xử lý phản hồi lỗi từ server (4xx, 5xx)
    if (isJson) {
      try {
        const errorJson = (await response.json()) as {
          error?: {
            code?: string;
            message?: string;
            details?: ApiErrorDetail[];
          };
          message?: string;
        };

        if (errorJson?.error) {
          throw new ApiError(
            errorJson.error.message || 'Yêu cầu không thành công',
            response.status,
            errorJson.error.code || 'UNKNOWN_ERROR',
            errorJson.error.details,
          );
        }

        throw new ApiError(
          errorJson?.message || response.statusText || 'Yêu cầu không thành công',
          response.status,
          'HTTP_ERROR',
        );
      } catch (parseErr: unknown) {
        if (parseErr instanceof ApiError) {
          throw parseErr;
        }
      }
    }

    const rawText = await response.text().catch(() => '');
    throw new ApiError(
      rawText || response.statusText || `Lỗi máy chủ (${response.status})`,
      response.status,
      'HTTP_ERROR',
    );
  },

  get<T>(endpoint: string, options: Omit<RequestOptions, 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(
    endpoint: string,
    body?: unknown,
    options: Omit<RequestOptions, 'body'> = {},
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  },

  put<T>(
    endpoint: string,
    body?: unknown,
    options: Omit<RequestOptions, 'body'> = {},
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  },

  patch<T>(
    endpoint: string,
    body?: unknown,
    options: Omit<RequestOptions, 'body'> = {},
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  },

  delete<T>(endpoint: string, options: Omit<RequestOptions, 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  },
};
