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
    return 'postgresql://postgres:postgres@localhost:5432/studysync';
  }
  return url;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: readPort(),
  databaseUrl: readDatabaseUrl(),
};
