export interface ErrorDetail {
  field?: string;
  issue: string;
  line?: number;
}

export abstract class AppError extends Error {
  public abstract readonly statusCode: number;
  public abstract readonly code: string;
  public readonly details?: ErrorDetail[];

  constructor(message: string, details?: ErrorDetail[]) {
    super(message);
    this.name = this.constructor.name;
    this.details = details && details.length > 0 ? details : undefined;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public get status(): number {
    return this.statusCode;
  }
}

export class ValidationError extends AppError {
  public readonly statusCode = 400;
  public readonly code: string;

  constructor(message: string, details?: ErrorDetail[], code = 'VALIDATION_ERROR') {
    super(message, details);
    this.code = code;
  }
}

export class UnauthorizedError extends AppError {
  public readonly statusCode = 401;
  public readonly code: string;

  constructor(
    message = 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn',
    details?: ErrorDetail[],
    code = 'UNAUTHORIZED',
  ) {
    super(message, details);
    this.code = code;
  }
}

export class ForbiddenError extends AppError {
  public readonly statusCode = 403;
  public readonly code: string;

  constructor(
    message = 'Không có quyền truy cập tài nguyên này',
    details?: ErrorDetail[],
    code = 'FORBIDDEN',
  ) {
    super(message, details);
    this.code = code;
  }
}

export class NotFoundError extends AppError {
  public readonly statusCode = 404;
  public readonly code: string;

  constructor(
    message = 'Không tìm thấy tài nguyên yêu cầu',
    details?: ErrorDetail[],
    code = 'NOT_FOUND',
  ) {
    super(message, details);
    this.code = code;
  }
}

export class ConflictError extends AppError {
  public readonly statusCode = 409;
  public readonly code: string;

  constructor(
    message = 'Dữ liệu bị trùng lặp hoặc xung đột trạng thái',
    details?: ErrorDetail[],
    code = 'CONFLICT',
  ) {
    super(message, details);
    this.code = code;
  }
}

export class FileTooLargeError extends AppError {
  public readonly statusCode = 413;
  public readonly code: string;

  constructor(
    message = 'Kích thước tệp vượt quá giới hạn 5 MB (BR-05)',
    details?: ErrorDetail[],
    code = 'FILE_TOO_LARGE',
  ) {
    super(message, details);
    this.code = code;
  }
}

export class FileInvalidError extends AppError {
  public readonly statusCode = 422;
  public readonly code: string;

  constructor(
    message = 'Tệp không đúng định dạng hoặc chứa dữ liệu không hợp lệ (BR-06)',
    details?: ErrorDetail[],
    code = 'FILE_INVALID',
  ) {
    super(message, details);
    this.code = code;
  }
}
