import { config } from 'dotenv';

config({ quiet: true });

export type NodeEnv = 'development' | 'production' | 'test';

function readNodeEnv(): NodeEnv {
  const raw = process.env.NODE_ENV ?? 'development';
  if (raw !== 'development' && raw !== 'production' && raw !== 'test') {
    throw new Error(
      `NODE_ENV không hợp lệ: "${raw}". Chỉ chấp nhận: development, production, test`,
    );
  }
  return raw;
}

function readPort(): number {
  const raw = process.env.PORT ?? '3000';
  const port = Number(raw);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`PORT không hợp lệ: "${raw}"`);
  }
  return port;
}

function readDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    if (process.env.NODE_ENV === 'test') {
      return 'postgresql://postgres:postgres@localhost:5432/studysync_test';
    }
    throw new Error('DATABASE_URL không được để trống');
  }
  return url;
}

export function readDirectUrl(
  envSource: { DIRECT_URL?: string; DATABASE_URL?: string } = process.env,
): string {
  const directUrl = envSource.DIRECT_URL;
  if (directUrl && directUrl.trim().length > 0) {
    return directUrl.trim();
  }
  return envSource.DATABASE_URL?.trim() || readDatabaseUrl();
}

function readJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  const nodeEnv = process.env.NODE_ENV ?? 'development';

  if (!secret || secret.includes('<') || secret.includes('>')) {
    if (nodeEnv === 'production') {
      throw new Error(
        'JWT_SECRET bắt buộc và không được chứa ký tự mẫu "<>" trong môi trường production',
      );
    }
    return 'studysync-dev-insecure-secret-key-32chars-minimum!';
  }

  if (nodeEnv === 'production' && secret.length < 32) {
    throw new Error('JWT_SECRET phải có độ dài tối thiểu 32 ký tự trong môi trường production');
  }

  return secret;
}

function readJwtExpiresIn(): string {
  const exp = process.env.JWT_EXPIRES_IN?.trim();
  return exp && exp.length > 0 ? exp : '7d';
}

function readCorsOrigin(): string {
  const origin = process.env.CORS_ORIGIN?.trim();
  const nodeEnv = process.env.NODE_ENV ?? 'development';

  if (!origin || origin === '*') {
    if (nodeEnv === 'production') {
      throw new Error('CORS_ORIGIN bắt buộc phải được cấu hình cụ thể trong môi trường production');
    }
    return '*';
  }

  return origin;
}

function readAppTimezone(): string {
  const tz = process.env.APP_TIMEZONE?.trim();
  return tz && tz.length > 0 ? tz : 'Asia/Ho_Chi_Minh';
}

function readMaxImportFileMb(): number {
  const raw = process.env.MAX_IMPORT_FILE_MB ?? '5';
  const mb = Number(raw);
  if (!Number.isFinite(mb) || mb <= 0) {
    throw new Error(`MAX_IMPORT_FILE_MB không hợp lệ: "${raw}"`);
  }
  return mb;
}

export const env = {
  nodeEnv: readNodeEnv(),
  port: readPort(),
  databaseUrl: readDatabaseUrl(),
  directUrl: readDirectUrl(),
  jwtSecret: readJwtSecret(),
  jwtExpiresIn: readJwtExpiresIn(),
  corsOrigin: readCorsOrigin(),
  appTimezone: readAppTimezone(),
  maxImportFileMb: readMaxImportFileMb(),
};
