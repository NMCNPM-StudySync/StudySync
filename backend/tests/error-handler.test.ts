import express, { type Request, type Response } from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { errorHandler } from '../src/middlewares/error-handler';
import { notFoundHandler } from '../src/middlewares/not-found-handler';
import {
  ConflictError,
  FileInvalidError,
  FileTooLargeError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../src/shared/errors';

describe('Global Error Handling Middleware', () => {
  function createTestApp() {
    const app = express();
    app.use(express.json());

    app.get('/test/validation-error', () => {
      throw new ValidationError('Dữ liệu không hợp lệ', [
        { field: 'dueAt', issue: 'thiếu hậu tố Z' },
      ]);
    });

    app.get('/test/unauthorized-error', () => {
      throw new UnauthorizedError();
    });

    app.get('/test/forbidden-error', () => {
      throw new ForbiddenError('Chỉ trưởng nhóm mới có quyền');
    });

    app.get('/test/not-found-error', () => {
      throw new NotFoundError('Không tìm thấy sự kiện');
    });

    app.get('/test/conflict-error', () => {
      throw new ConflictError('Khung giờ bị trùng lặp');
    });

    app.get('/test/file-too-large', () => {
      throw new FileTooLargeError();
    });

    app.get('/test/file-invalid', () => {
      throw new FileInvalidError('Tệp CSV chứa dòng không hợp lệ', [
        { line: 5, issue: 'thiếu cột bắt buộc' },
      ]);
    });

    app.get('/test/unhandled-error', () => {
      throw new Error('Database connection failed');
    });

    app.get('/test/body-parser-413', () => {
      const err = new Error('request entity too large') as Error & {
        status: number;
        type: string;
      };
      err.status = 413;
      err.type = 'entity.too.large';
      throw err;
    });

    app.get('/test/body-parser-400-custom', () => {
      const err = new Error('Invalid encoding') as Error & { status: number };
      err.status = 400;
      throw err;
    });

    app.post('/test/json-body', (req: Request, res: Response) => {
      res.json({ received: req.body });
    });

    app.use(notFoundHandler);
    app.use(errorHandler);
    return app;
  }

  it('xử lý ValidationError trả về 400 với format chuẩn', async () => {
    const res = await request(createTestApp()).get('/test/validation-error');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dữ liệu không hợp lệ',
        details: [{ field: 'dueAt', issue: 'thiếu hậu tố Z' }],
      },
    });
  });

  it('xử lý UnauthorizedError trả về 401 với code UNAUTHORIZED', async () => {
    const res = await request(createTestApp()).get('/test/unauthorized-error');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('xử lý ForbiddenError trả về 403 với code FORBIDDEN', async () => {
    const res = await request(createTestApp()).get('/test/forbidden-error');

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
    expect(res.body.error.message).toBe('Chỉ trưởng nhóm mới có quyền');
  });

  it('xử lý NotFoundError trả về 404 với code NOT_FOUND', async () => {
    const res = await request(createTestApp()).get('/test/not-found-error');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('xử lý ConflictError trả về 409 với code CONFLICT', async () => {
    const res = await request(createTestApp()).get('/test/conflict-error');

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('xử lý FileTooLargeError trả về 413 với code FILE_TOO_LARGE', async () => {
    const res = await request(createTestApp()).get('/test/file-too-large');

    expect(res.status).toBe(413);
    expect(res.body.error.code).toBe('FILE_TOO_LARGE');
  });

  it('xử lý FileInvalidError trả về 422 kèm details số dòng', async () => {
    const res = await request(createTestApp()).get('/test/file-invalid');

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('FILE_INVALID');
    expect(res.body.error.details).toEqual([{ line: 5, issue: 'thiếu cột bắt buộc' }]);
  });

  it('xử lý lỗi không xác định trả về 500 INTERNAL_ERROR và không để lộ stack trace', async () => {
    const res = await request(createTestApp()).get('/test/unhandled-error');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Đã xảy ra lỗi nội bộ máy chủ',
      },
    });
    expect(res.body.error.stack).toBeUndefined();
  });

  it('bắt lỗi cú pháp JSON trong request body trả về 400 VALIDATION_ERROR', async () => {
    const res = await request(createTestApp())
      .post('/test/json-body')
      .set('Content-Type', 'application/json')
      .send('{ "invalidJson": ');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.message).toBe('Dữ liệu JSON trong yêu cầu không đúng định dạng');
  });

  it('xử lý lỗi body-parser 413 entity too large trả về đúng 413 FILE_TOO_LARGE', async () => {
    const res = await request(createTestApp()).get('/test/body-parser-413');

    expect(res.status).toBe(413);
    expect(res.body.error.code).toBe('FILE_TOO_LARGE');
  });

  it('xử lý lỗi body-parser 4xx khác (như charset không hỗ trợ) trả về 400 VALIDATION_ERROR với câu tiếng Việt chuẩn (Nhi Review #2)', async () => {
    const res = await request(createTestApp())
      .post('/test/json-body')
      .set('Content-Type', 'application/json; charset=latin9')
      .send('{"name":"test"}');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Yêu cầu không hợp lệ',
      },
    });
  });

  it('xử lý lỗi body-parser 400 tùy biến khác trả về 400 VALIDATION_ERROR', async () => {
    const res = await request(createTestApp()).get('/test/body-parser-400-custom');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.message).toBe('Yêu cầu không hợp lệ');
  });

  it('xử lý route không tồn tại qua notFoundHandler trả về 404 NOT_FOUND', async () => {
    const res = await request(createTestApp()).get('/non-existent-route');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'Đường dẫn hoặc tài nguyên không tồn tại',
      },
    });
  });
});
