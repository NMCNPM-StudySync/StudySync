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
  return { service, users, db };
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

  it.each([
    ['email rỗng', { email: '', password: 'matkhau2026' }, ['email']],
    ['email chỉ khoảng trắng', { email: '   ', password: 'matkhau2026' }, ['email']],
    ['mật khẩu rỗng', { email: 'a@b.co', password: '' }, ['password']],
    ['cả hai rỗng', { email: '', password: '' }, ['email', 'password']],
  ])('đăng nhập: %s -> 400 VALIDATION_ERROR, không truy vấn DB', async (_l, input, fields) => {
    const calls = (ctx.db.query as ReturnType<typeof vi.fn>).mock.calls.length;
    await expect(ctx.service.login(input)).rejects.toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      details: fields.map((field) => expect.objectContaining({ field })),
    });
    expect((ctx.db.query as ReturnType<typeof vi.fn>).mock.calls.length).toBe(calls);
  });

  it('getMe: tài khoản không còn tồn tại -> 401', async () => {
    await expect(ctx.service.getMe('00000000-0000-4000-8000-0000000000ff')).rejects.toMatchObject({
      statusCode: 401,
      code: 'UNAUTHORIZED',
    });
  });

  it('BR-08 displayName: 100 ký tự hợp lệ, 101 bị từ chối, emoji đếm theo code point', async () => {
    const ok = await ctx.service.register({ ...validInput, displayName: 'a'.repeat(100) });
    expect(ok.user.displayName).toHaveLength(100);

    const rejects = (displayName: string, email: string) =>
      expect(ctx.service.register({ ...validInput, email, displayName })).rejects.toMatchObject({
        statusCode: 400,
        details: [expect.objectContaining({ field: 'displayName' })],
      });
    await rejects('a'.repeat(101), 'b1@example.com');

    const emoji100 = await ctx.service.register({
      ...validInput,
      email: 'b2@example.com',
      displayName: '😀'.repeat(100),
    });
    expect([...emoji100.user.displayName]).toHaveLength(100);
    await rejects('😀'.repeat(101), 'b3@example.com');
  });

  it('BR-08 displayName: chuẩn hóa NFD -> NFC trước khi lưu', async () => {
    const result = await ctx.service.register({
      ...validInput,
      displayName: 'Nguyễn Văn An'.normalize('NFD'),
    });
    expect(result.user.displayName).toBe('Nguyễn Văn An'.normalize('NFC'));
    expect([...ctx.users.values()][0]!.display_name).toBe('Nguyễn Văn An'.normalize('NFC'));
  });

  it('BR-07: createdAt và expiresAt là ISO 8601 UTC có mili giây (.000Z)', async () => {
    const result = await ctx.service.register(validInput);
    const iso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    expect(result.user.createdAt).toBe('2026-11-05T13:00:00.000Z');
    expect(result.expiresAt).toMatch(iso);
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
  let groupCalls: { text: string; params?: unknown[] }[] = [];

  function buildApp() {
    const { service } = createService();
    const groupRows: Record<string, unknown>[] = [];
    groupCalls = [];
    const groupDb = {
      query: vi.fn(async (text: string, params?: unknown[]) => {
        groupCalls.push({ text, params });
        if (text.includes('INSERT INTO groups')) {
          // Lấy tên từ tham số thật gửi xuống DB để kiểm tra chuẩn hóa.
          const row = {
            id: 'g1',
            name: params?.[0],
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

  async function registerToken(app: ReturnType<typeof buildApp>): Promise<string> {
    const reg = await request(app).post('/api/auth/register').send(validInput);
    return `Bearer ${reg.body.data.token}`;
  }

  it('GET /api/groups khi chưa có nhóm nào -> 200 với groups: []', async () => {
    const app = buildApp();
    const auth = await registerToken(app);
    const list = await request(app).get('/api/groups').set('Authorization', auth);
    expect(list.status).toBe(200);
    expect(list.body.data).toEqual({ groups: [] });
  });

  it('login thiếu hoặc rỗng email/mật khẩu -> 400 VALIDATION_ERROR, không truy vấn DB', async () => {
    const app = buildApp();
    for (const body of [
      {},
      { email: '', password: '' },
      { email: '   ', password: 'matkhau2026' },
      { email: 'an.nguyen@example.com', password: '' },
    ]) {
      const res = await request(app).post('/api/auth/login').send(body);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details.length).toBeGreaterThan(0);
    }
  });

  it('BR-08 tên nhóm: đúng 100 ký tự hợp lệ, 101 ký tự bị từ chối và không ghi DB', async () => {
    const app = buildApp();
    const auth = await registerToken(app);

    const ok = await request(app)
      .post('/api/groups')
      .set('Authorization', auth)
      .send({ name: 'a'.repeat(100) });
    expect(ok.status).toBe(201);

    groupCalls = [];
    const tooLong = await request(app)
      .post('/api/groups')
      .set('Authorization', auth)
      .send({ name: 'a'.repeat(101) });
    expect(tooLong.status).toBe(400);
    expect(tooLong.body.error.details).toEqual([expect.objectContaining({ field: 'name' })]);
    expect(groupCalls).toHaveLength(0);
  });

  it('BR-08 tên nhóm: đếm theo code point (emoji) và chuẩn hóa NFC, cắt khoảng trắng', async () => {
    const app = buildApp();
    const auth = await registerToken(app);

    // 100 emoji = 100 code point (200 đơn vị UTF-16) vẫn hợp lệ; 101 thì không.
    const emoji100 = await request(app)
      .post('/api/groups')
      .set('Authorization', auth)
      .send({ name: '😀'.repeat(100) });
    expect(emoji100.status).toBe(201);
    const emoji101 = await request(app)
      .post('/api/groups')
      .set('Authorization', auth)
      .send({ name: '😀'.repeat(101) });
    expect(emoji101.status).toBe(400);

    const nfd = '  Đồ án nhóm 04  '.normalize('NFD');
    const res = await request(app)
      .post('/api/groups')
      .set('Authorization', auth)
      .send({ name: nfd });
    expect(res.status).toBe(201);
    const insert = groupCalls.filter((c) => c.text.includes('INSERT INTO groups')).at(-1)!;
    expect(insert.params).toEqual(['Đồ án nhóm 04'.normalize('NFC')]);
    expect(res.body.data.name).toBe('Đồ án nhóm 04'.normalize('NFC'));
  });

  it('Trưởng nhóm được lưu can_organize_meetings mặc định (false), không ghi true', async () => {
    const app = buildApp();
    const auth = await registerToken(app);
    await request(app).post('/api/groups').set('Authorization', auth).send({ name: 'Nhóm A' });
    const insert = groupCalls.find((c) => c.text.includes('INSERT INTO group_members'))!;
    expect(insert.text).not.toMatch(/can_organize_meetings/);
    expect(insert.text).toContain(`'leader'`);
  });

  it('BR-07: createdAt và expiresAt theo ISO 8601 UTC có mili giây', async () => {
    const app = buildApp();
    const reg = await request(app).post('/api/auth/register').send(validInput);
    const iso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    expect(reg.body.data.user.createdAt).toMatch(iso);
    expect(reg.body.data.expiresAt).toMatch(iso);

    const auth = `Bearer ${reg.body.data.token}`;
    const group = await request(app)
      .post('/api/groups')
      .set('Authorization', auth)
      .send({ name: 'N' });
    expect(group.body.data.createdAt).toMatch(iso);
  });
});

describe('createApiRouter: dùng chung options.authenticate', () => {
  const stubGroups = {
    create: vi.fn(async (userId: string, name: unknown) => ({
      id: 'g1',
      name: String(name),
      myRole: 'leader',
      memberCount: 1,
      createdAt: userId,
    })),
    listMine: vi.fn(async () => ({ groups: [] })),
  } as unknown as GroupService;

  it('mount /api/groups chỉ với groups + authenticate (không cần AuthService)', async () => {
    const authenticate = vi.fn((req: Request, _res: Response, next: NextFunction) => {
      req.userId = 'mock-user';
      next();
    });
    const app = createApp({ groups: stubGroups, authenticate });

    const res = await request(app).post('/api/groups').send({ name: 'Nhóm mock' });
    expect(res.status).toBe(201);
    expect(res.body.data.createdAt).toBe('mock-user');
    expect(authenticate).toHaveBeenCalled();
  });

  it('không có authenticate lẫn auth thì không mount /api/groups (404)', async () => {
    const app = createApp({ groups: stubGroups });
    expect((await request(app).get('/api/groups')).status).toBe(404);
  });

  it('options.authenticate được ưu tiên hơn middleware dựng từ AuthService', async () => {
    const { service } = createService();
    const authenticate = vi.fn((_req: Request, _res: Response, next: NextFunction) =>
      next(new UnauthorizedError('từ chối bởi mock')),
    );
    const app = createApp({ auth: service, authenticate });
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('từ chối bởi mock');
  });
});
