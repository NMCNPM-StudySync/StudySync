import { config } from 'dotenv';

config({ quiet: true });

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

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: readPort(),
  databaseUrl: readDatabaseUrl(),
  directUrl: readDirectUrl(),
};
