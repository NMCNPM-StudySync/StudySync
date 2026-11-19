export interface ApiWarning {
  code: string;
  message: string;
  details?: Array<{ field?: string; issue: string }>;
}

export interface ApiErrorDetail {
  field?: string;
  issue: string;
  line?: number;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: ApiErrorDetail[];
}

export interface ApiResponse<T> {
  data: T;
  warnings?: ApiWarning[];
}
