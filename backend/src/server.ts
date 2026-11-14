import { createApp } from './app';
import { closePool } from './config/db';
import { env } from './config/env';

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`Backend chạy tại http://localhost:${env.port} (${env.nodeEnv})`);
});

let isShuttingDown = false;

async function handleShutdown(): Promise<void> {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;

  server.close(async () => {
    await closePool();
    process.exit(0);
  });
}

process.on('SIGINT', () => {
  void handleShutdown();
});

process.on('SIGTERM', () => {
  void handleShutdown();
});
