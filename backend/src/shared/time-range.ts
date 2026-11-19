import type { TimeInterval } from '../utils/interval';

export interface TimeRange {
  startsAt: Date;
  endsAt: Date;
  toInterval(): TimeInterval;
}
