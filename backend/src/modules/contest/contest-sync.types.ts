import type { ContestPlatform } from "../../../generated/prisma/enums.js";

export interface ProviderSyncResult {
  platform: ContestPlatform;
  success: boolean;
  noOfContestFetched: number;
  error?: string;
}

export interface ContestSyncSummary {
  startedAt: Date;
  completedAt: Date;
  durationMs: number;
  totalContestFetched: number;
  providerResults: ProviderSyncResult[];
}
