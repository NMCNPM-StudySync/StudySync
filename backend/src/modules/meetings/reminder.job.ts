/** Bộ hẹn giờ quét nhắc việc đến hạn mỗi `REMINDER_POLL_SECONDS` giây (mặc định 60). */
import type { Clock } from './deps';
import type { ReminderService } from './reminder.service';

export interface ReminderJobOptions {
  intervalMs?: number;
  clock: Clock;
  onError?: (error: unknown) => void;
}

export class ReminderJob {
  private timer: ReturnType<typeof setInterval> | null = null;
  private isRunning = false;
  private readonly intervalMs: number;

  constructor(
    private readonly service: Pick<ReminderService, 'dispatchDue'>,
    private readonly options: ReminderJobOptions,
  ) {
    this.intervalMs = options.intervalMs ?? 60_000;
  }

  /** Một lượt quét; bỏ qua nếu lượt trước chưa xong. Không ném lỗi ra ngoài. */
  public async runOnce(): Promise<number> {
    if (this.isRunning) return 0;
    this.isRunning = true;
    try {
      return await this.service.dispatchDue(this.options.clock());
    } catch (error) {
      this.options.onError?.(error);
      return 0;
    } finally {
      this.isRunning = false;
    }
  }

  public start(): void {
    if (this.timer) return;
    void this.runOnce();
    this.timer = setInterval(() => void this.runOnce(), this.intervalMs);
    this.timer.unref?.();
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
