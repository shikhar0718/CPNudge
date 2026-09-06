import { ContestPlatform } from "../../../../generated/prisma/enums.js";
import { SubmissionActivitySyncService } from "./submission-sync.service.js";
import { getSubmissionActivityByUser } from "./submission.repository.js";
import type { SubmissionActivitySyncSummary } from "./submission-sync.types.js";

export class SubmissionService {
  private readonly submissionActivitySyncService = new SubmissionActivitySyncService();

  async getUserSubmissionActivity(userId: string, platform?: ContestPlatform) {
    return getSubmissionActivityByUser(userId, platform);
  }

  async syncSubmissionActivity(): Promise<SubmissionActivitySyncSummary> {
    return this.submissionActivitySyncService.syncSubmissionActivity();
  }

  async syncUserSubmissionActivity(userId: string): Promise<SubmissionActivitySyncSummary> {
    return this.submissionActivitySyncService.syncUserSubmissionActivity(userId);
  }
}

export const submissionService = new SubmissionService();
