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

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: readPort(),
};
