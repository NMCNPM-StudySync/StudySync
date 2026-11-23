import { createApp } from './app';
import { closePool } from './config/db';
import { env } from './config/env';
import { createMeetingsModule } from './modules/meetings/meetings.module';

const meetings = createMeetingsModule();
const app = createApp({ meetings: meetings.services });
meetings.reminderJob.start();

const server = app.listen(env.port, () => {
  console.log(`Backend chạy tại http://localhost:${env.port} (${env.nodeEnv})`);
});

let isShuttingDown = false;

async function handleShutdown(): Promise<void> {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;
  meetings.reminderJob.stop();

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
