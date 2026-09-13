import type { ContestPlatform } from "../../../../generated/prisma/enums.js";

export interface SubmissionActivitySyncSummary {
  startedAt: Date;
  completedAt: Date;
  durationMs: number;
  profilesProcessed: number;
  totalSubmissionFetched: number;
}

export interface UpsertSubmissionActivityParams {
  userId: string;
  platform: ContestPlatform;
  activityDate: Date;
  submissionCount: number;
}
