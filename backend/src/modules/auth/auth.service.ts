import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { pool } from '../../config/db';
import { env } from '../../config/env';
import type { Queryable } from '../../shared/base-repository';
import { ConflictError, UnauthorizedError, ValidationError } from '../../shared/errors';
import { validateDisplayName } from '../../utils/validation';
import { toPublicUser, type PublicUser } from './user.entity';
import { UserRepository } from './user.repository';

export interface AuthResult {
  token: string;
  expiresAt: string;
  user: PublicUser;
}

export interface AuthServiceOptions {
  jwtSecret: string;
  jwtExpiresIn: string;
  /** Cost của bcrypt; test có thể hạ xuống để chạy nhanh. */
  bcryptCost: number;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_MAX_LENGTH = 254;
const PASSWORD_MIN = 8;
const PASSWORD_MAX_BYTES = 72; // bcrypt chỉ dùng 72 byte đầu

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidPassword(password: string): boolean {
  return (
    password.length >= PASSWORD_MIN &&
    Buffer.byteLength(password, 'utf8') <= PASSWORD_MAX_BYTES &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password)
  );
}

export class AuthService {
  private readonly options: AuthServiceOptions;
  /** Hash giả để đăng nhập email không tồn tại tốn thời gian tương đương (chống dò email). */
  private dummyHash: Promise<string> | null = null;

  constructor(
    private readonly repo: UserRepository = new UserRepository(),
    private readonly db: Queryable = pool,
    options?: Partial<AuthServiceOptions>,
  ) {
    this.options = {
      jwtSecret: options?.jwtSecret ?? env.jwtSecret,
      jwtExpiresIn: options?.jwtExpiresIn ?? env.jwtExpiresIn,
      bcryptCost: options?.bcryptCost ?? 10,
    };
  }

  public async register(input: {
    displayName: unknown;
    email: unknown;
    password: unknown;
  }): Promise<AuthResult> {
    const details: { field: string; issue: string }[] = [];

    const name = validateDisplayName(input.displayName);
    if (!name.isValid) {
      details.push({
        field: 'displayName',
        issue: 'Họ tên không được để trống và tối đa 100 ký tự',
      });
    }

    const email = typeof input.email === 'string' ? normalizeEmail(input.email) : '';
    if (!EMAIL_PATTERN.test(email) || email.length > EMAIL_MAX_LENGTH) {
      details.push({ field: 'email', issue: 'Địa chỉ email không đúng định dạng' });
    }

    if (typeof input.password !== 'string' || !isValidPassword(input.password)) {
      details.push({
        field: 'password',
        issue: 'Mật khẩu từ 8 đến 72 ký tự, gồm cả chữ cái và chữ số',
      });
    }

    if (details.length > 0 || !name.isValid) {
      throw new ValidationError('Dữ liệu đăng ký không hợp lệ', details);
    }

    const passwordHash = await bcrypt.hash(input.password as string, this.options.bcryptCost);

    try {
      const user = await this.repo.create(
        { email, passwordHash, displayName: name.normalized },
        this.db,
      );
      return this.buildAuthResult(user.id, toPublicUser(user));
    } catch (err) {
      if ((err as { code?: string }).code === '23505') {
        throw new ConflictError(
          'Email này đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng email khác.',
          [{ field: 'email', issue: 'đã được sử dụng' }],
        );
      }
      throw err;
    }
  }

  public async login(input: { email: unknown; password: unknown }): Promise<AuthResult> {
    const emailMissing = typeof input.email !== 'string' || input.email.trim().length === 0;
    const passwordMissing = typeof input.password !== 'string' || input.password.length === 0;
    if (emailMissing || passwordMissing) {
      throw new ValidationError('Vui lòng nhập email và mật khẩu', [
        ...(emailMissing ? [{ field: 'email', issue: 'bắt buộc' }] : []),
        ...(passwordMissing ? [{ field: 'password', issue: 'bắt buộc' }] : []),
      ]);
    }
    const { email, password } = input as { email: string; password: string };

    const user = await this.repo.findByEmail(normalizeEmail(email), this.db);
    const hash = user ? user.passwordHash : await this.getDummyHash();
    const matched = await bcrypt.compare(password, hash);

    if (!user || !matched) {
      throw new UnauthorizedError('Email hoặc mật khẩu không chính xác');
    }
    return this.buildAuthResult(user.id, toPublicUser(user));
  }

  public async getMe(userId: string): Promise<PublicUser> {
    const user = await this.repo.findById(userId, this.db);
    if (!user) {
      // Token còn hạn nhưng tài khoản không còn tồn tại.
      throw new UnauthorizedError();
    }
    return toPublicUser(user);
  }

  /** Trả userId nếu token hợp lệ, ngược lại ném UnauthorizedError. */
  public verifyToken(token: string): string {
    let payload: string | jwt.JwtPayload;
    try {
      payload = jwt.verify(token, this.options.jwtSecret, { algorithms: ['HS256'] });
    } catch {
      throw new UnauthorizedError();
    }
    if (typeof payload === 'string' || typeof payload.sub !== 'string' || !payload.sub) {
      throw new UnauthorizedError();
    }
    return payload.sub;
  }

  private buildAuthResult(userId: string, user: PublicUser): AuthResult {
    const token = jwt.sign({}, this.options.jwtSecret, {
      subject: userId,
      algorithm: 'HS256',
      expiresIn: this.options.jwtExpiresIn as SignOptions['expiresIn'],
    });
    const { exp } = jwt.decode(token) as { exp: number };
    return { token, expiresAt: new Date(exp * 1000).toISOString(), user };
  }

  private getDummyHash(): Promise<string> {
    this.dummyHash ??= bcrypt.hash('studysync-dummy-password-1', this.options.bcryptCost);
    return this.dummyHash;
  }
}
