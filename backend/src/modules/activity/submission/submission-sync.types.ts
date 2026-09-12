export interface SubmissionActivitySyncSummary {
  startedAt: Date;
  completedAt: Date;
  durationMs: number;
  profilesProcessed: number;
  totalSubmissionFetched: number;
}
