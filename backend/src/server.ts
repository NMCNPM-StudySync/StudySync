import { createApp } from './app';
import { closePool } from './config/db';
import { env } from './config/env';
import { createAuthMiddleware } from './middlewares/authenticate';
import { AuthService } from './modules/auth/auth.service';
import { GroupService } from './modules/groups/group.service';
import { createMeetingsModule } from './modules/meetings/meetings.module';

const meetings = createMeetingsModule();
const auth = new AuthService();
const groups = new GroupService();
const app = createApp({
  auth,
  groups,
  meetings: meetings.services,
  authenticate: createAuthMiddleware(auth.verifyToken.bind(auth)),
});
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
