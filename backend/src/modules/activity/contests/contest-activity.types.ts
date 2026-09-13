import type {
  ContestPlatform,
  ContestParticipationActivity,
} from "../../../../generated/prisma/client.js";

export type ContestParticipation = ContestParticipationActivity;

export interface UpsertContestActivityParams {
  platform: ContestPlatform;
  contestId: string;
  contestName: string;
  participatedAt: Date;
}

export interface ContestActivitySyncSummary {
  processedAccounts: number;
  successfulAccounts: number;
  failedAccounts: number;
  totalParticipationsStored: number;
  startedAt?: Date;
  completedAt?: Date;
  durationMs?: number;
}

export interface LinkedAccountForSync {
  id: string;
  userId: string;
  platform: ContestPlatform;
  username: string;
  lastContestParticipationDate?: Date | null;
}
