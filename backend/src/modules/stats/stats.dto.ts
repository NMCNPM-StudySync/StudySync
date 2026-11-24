export interface DayStudyStat {
  date: string;
  dayOfWeek: number;
  minutes: number;
}

export interface WeeklyStudyStatsResponse {
  from: string;
  to: string;
  totalMinutes: number;
  days: DayStudyStat[];
}
