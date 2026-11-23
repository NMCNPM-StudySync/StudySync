import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app';
import { createAuthMiddleware } from '../src/middlewares/authenticate';
import { AuthService } from '../src/modules/auth/auth.service';
import { UserRepository } from '../src/modules/auth/user.repository';
import { GroupService } from '../src/modules/groups/group.service';
import type { Queryable } from '../src/shared/base-repository';
import { UnauthorizedError } from '../src/shared/errors';

const SECRET = 'test-secret-test-secret-test-secret-32';

function createFakeUserDb() {
  const users = new Map<string, Record<string, unknown>>();
  const db: Queryable = {
    query: vi.fn(async (text: string, params?: unknown[]) => {
      if (text.startsWith('INSERT INTO users')) {
        const [email, passwordHash, displayName] = params as string[];
        if ([...users.values()].some((u) => u.email === email)) {
          throw Object.assign(new Error('duplicate'), { code: '23505' });
        }
        const row = {
          id: `00000000-0000-4000-8000-${String(users.size + 1).padStart(12, '0')}`,
          email,
          password_hash: passwordHash,
          display_name: displayName,
          created_at: new Date('2026-11-05T13:00:00.000Z'),
          updated_at: new Date('2026-11-05T13:00:00.000Z'),
        };
        users.set(row.id, row);
        return { rows: [row], rowCount: 1 };
      }
      if (text.includes('WHERE email = $1')) {
        const row = [...users.values()].find((u) => u.email === params?.[0]);
        return { rows: row ? [row] : [], rowCount: row ? 1 : 0 };
      }
      if (text.includes('WHERE id = $1')) {
        const row = users.get(params?.[0] as string);
        return { rows: row ? [row] : [], rowCount: row ? 1 : 0 };
      }
      return { rows: [], rowCount: 0 };
    }),
  } as unknown as Queryable;
  return { db, users };
}

function createService() {
  const { db, users } = createFakeUserDb();
  const service = new AuthService(new UserRepository(), db, {
    jwtSecret: SECRET,
    jwtExpiresIn: '7d',
    bcryptCost: 4,
  });
  return { service, users };
}

const validInput = {
  displayName: '  Nguyễn Văn An ',
  email: ' An.Nguyen@Example.com ',
  password: 'matkhau2026',
};

describe('AuthService', () => {
  let ctx: ReturnType<typeof createService>;
  beforeEach(() => {
    ctx = createService();
  });

  it('đăng ký: chuẩn hóa dữ liệu, băm mật khẩu, cấp token và không lộ passwordHash', async () => {
    const result = await ctx.service.register(validInput);

    expect(result.user.email).toBe('an.nguyen@example.com');
    expect(result.user.displayName).toBe('Nguyễn Văn An');
    expect(JSON.stringify(result)).not.toContain('passwordHash');
    expect(ctx.service.verifyToken(result.token)).toBe(result.user.id);

    const stored = [...ctx.users.values()][0]!;
    expect(stored.password_hash).not.toBe(validInput.password);
    expect(String(stored.password_hash)).toMatch(/^\$2[aby]\$/);
    expect(new Date(result.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  it.each([
    ['tên rỗng', { displayName: '   ' }, 'displayName'],
    ['email sai định dạng', { email: 'khong-phai-email' }, 'email'],
    ['mật khẩu quá ngắn', { password: 'abc123' }, 'password'],
    ['mật khẩu thiếu chữ số', { password: 'chuchuchuchu' }, 'password'],
    ['mật khẩu thiếu chữ cái', { password: '1234567890' }, 'password'],
    ['mật khẩu quá 72 byte', { password: 'a1'.repeat(40) }, 'password'],
  ])('đăng ký: %s -> 400 VALIDATION_ERROR', async (_label, patch, field) => {
    await expect(ctx.service.register({ ...validInput, ...patch })).rejects.toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      details: expect.arrayContaining([expect.objectContaining({ field })]),
    });
  });

  it('đăng ký: email trùng (không phân biệt hoa thường) -> 409 CONFLICT', async () => {
    await ctx.service.register(validInput);
    await expect(
      ctx.service.register({ ...validInput, email: 'AN.NGUYEN@example.com' }),
    ).rejects.toMatchObject({ statusCode: 409, code: 'CONFLICT' });
  });

  it('đăng nhập đúng -> trả token và user', async () => {
    const registered = await ctx.service.register(validInput);
    const result = await ctx.service.login({
      email: 'AN.NGUYEN@example.com',
      password: validInput.password,
    });
    expect(result.user.id).toBe(registered.user.id);
    expect(ctx.service.verifyToken(result.token)).toBe(registered.user.id);
  });

  it('đăng nhập sai mật khẩu hoặc email không tồn tại -> 401 cùng thông báo', async () => {
    await ctx.service.register(validInput);
    const wrongPassword = await ctx.service
      .login({ email: 'an.nguyen@example.com', password: 'saimatkhau1' })
      .catch((e: unknown) => e);
    const unknownEmail = await ctx.service
      .login({ email: 'khong.co@example.com', password: 'matkhau2026' })
      .catch((e: unknown) => e);

    for (const err of [wrongPassword, unknownEmail]) {
      expect(err).toBeInstanceOf(UnauthorizedError);
      expect(err).toMatchObject({
        statusCode: 401,
        message: 'Email hoặc mật khẩu không chính xác',
      });
    }
  });

  it('đăng nhập thiếu trường -> 400', async () => {
    await expect(ctx.service.login({ email: 'a@b.co', password: undefined })).rejects.toMatchObject(
      {
        statusCode: 400,
      },
    );
  });

  it('verifyToken: từ chối token sai chữ ký, hết hạn, không có sub', () => {
    const forged = jwt.sign({}, 'secret-khac-secret-khac-secret-khac-1', { subject: 'u1' });
    const expired = jwt.sign({}, SECRET, { subject: 'u1', expiresIn: -10 });
    const noSub = jwt.sign({}, SECRET);

    for (const token of [forged, expired, noSub, 'khong-phai-jwt']) {
      expect(() => ctx.service.verifyToken(token)).toThrow(UnauthorizedError);
    }
  });
});

describe('createAuthMiddleware', () => {
  const { service } = createService();
  const middleware = createAuthMiddleware(service.verifyToken.bind(service));

  function run(authorization?: string) {
    const req = { headers: authorization ? { authorization } : {} } as Request;
    const next = vi.fn() as unknown as NextFunction;
    middleware(req, {} as Response, next);
    return { req, next: next as unknown as ReturnType<typeof vi.fn> };
  }

  it('không có header Authorization -> 401', () => {
    const { next } = run();
    expect(next.mock.calls[0]![0]).toBeInstanceOf(UnauthorizedError);
  });

  it('sai scheme (không phải Bearer) -> 401', () => {
    const { next } = run('Basic abc');
    expect(next.mock.calls[0]![0]).toBeInstanceOf(UnauthorizedError);
  });

  it('token sai -> 401 và không gán userId', () => {
    const { req, next } = run('Bearer token-gia');
    expect(next.mock.calls[0]![0]).toBeInstanceOf(UnauthorizedError);
    expect(req.userId).toBeUndefined();
  });

  it('token hợp lệ -> gán req.userId và gọi next() không lỗi', () => {
    const token = jwt.sign({}, SECRET, { subject: 'user-1', expiresIn: '1h' });
    const { req, next } = run(`Bearer ${token}`);
    expect(req.userId).toBe('user-1');
    expect(next).toHaveBeenCalledWith();
  });
});

describe('API /api/auth, /api/users/me, /api/groups', () => {
  function buildApp() {
    const { service } = createService();
    const groupRows: Record<string, unknown>[] = [];
    const groupDb = {
      query: vi.fn(async (text: string) => {
        if (text.includes('INSERT INTO groups')) {
          const row = {
            id: 'g1',
            name: 'Đồ án nhóm 04',
            created_at: new Date('2026-11-05T13:00:00Z'),
          };
          groupRows.push(row);
          return { rows: [row], rowCount: 1 };
        }
        if (text.includes('FROM group_members gm')) {
          return {
            rows: groupRows.map((g) => ({ ...g, my_role: 'leader', member_count: '1' })),
            rowCount: groupRows.length,
          };
        }
        return { rows: [], rowCount: 1 };
      }),
    } as unknown as Queryable;
    const groups = new GroupService(undefined, groupDb, async (work) => work(groupDb as never));
    return createApp({ auth: service, groups });
  }

  it('đăng ký -> 201, đăng nhập sai -> 401, token hợp lệ lấy được /users/me', async () => {
    const app = buildApp();

    const reg = await request(app).post('/api/auth/register').send(validInput);
    expect(reg.status).toBe(201);
    expect(reg.body.data.token).toEqual(expect.any(String));

    const bad = await request(app)
      .post('/api/auth/login')
      .send({ email: 'an.nguyen@example.com', password: 'saimatkhau1' });
    expect(bad.status).toBe(401);
    expect(bad.body.error.code).toBe('UNAUTHORIZED');

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'an.nguyen@example.com', password: validInput.password });
    expect(login.status).toBe(200);

    const me = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${login.body.data.token}`);
    expect(me.status).toBe(200);
    expect(me.body.data).toMatchObject({ email: 'an.nguyen@example.com' });
    expect(me.body.data.passwordHash).toBeUndefined();

    expect((await request(app).get('/api/users/me')).status).toBe(401);
  });

  it('đăng ký trùng email -> 409; body không hợp lệ -> 400', async () => {
    const app = buildApp();
    await request(app).post('/api/auth/register').send(validInput);
    expect((await request(app).post('/api/auth/register').send(validInput)).status).toBe(409);
    expect((await request(app).post('/api/auth/register').send({})).status).toBe(400);
  });

  it('groups: cần token; tạo nhóm -> 201 myRole leader; danh sách trả về nhóm', async () => {
    const app = buildApp();
    expect((await request(app).get('/api/groups')).status).toBe(401);

    const reg = await request(app).post('/api/auth/register').send(validInput);
    const auth = `Bearer ${reg.body.data.token}`;

    const bad = await request(app)
      .post('/api/groups')
      .set('Authorization', auth)
      .send({ name: ' ' });
    expect(bad.status).toBe(400);

    const created = await request(app)
      .post('/api/groups')
      .set('Authorization', auth)
      .send({ name: 'Đồ án nhóm 04' });
    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({ myRole: 'leader', memberCount: 1 });

    const list = await request(app).get('/api/groups').set('Authorization', auth);
    expect(list.status).toBe(200);
    expect(list.body.data.groups).toHaveLength(1);
  });
});
