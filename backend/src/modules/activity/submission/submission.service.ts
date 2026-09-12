import { ContestPlatform } from "../../../../generated/prisma/enums.js";
import { SubmissionActivitySyncService } from "./submission-sync.service.js";
import { getSubmissionActivityByUser } from "./submission.repository.js";
import type { SubmissionActivitySyncSummary } from "./submission-sync.types.js";

export class SubmissionService {
  private readonly submissionActivitySyncService = new SubmissionActivitySyncService();

  async getUserSubmissionActivity(userId: string, platform?: ContestPlatform) {
    return getSubmissionActivityByUser(userId, platform);
  }

  async syncDueSubmissionActivity(limit: number = 500): Promise<SubmissionActivitySyncSummary> {
    return this.submissionActivitySyncService.syncDueSubmissionActivity(limit);
  }

  async syncUserSubmissionActivity(userId: string): Promise<SubmissionActivitySyncSummary> {
    return this.submissionActivitySyncService.syncUserSubmissionActivity(userId);
  }
}

export const submissionService = new SubmissionService();
