import { SubmissionActivitySyncService } from "../activity/submission/submission-sync.service.js";
import { logger } from "../../common/shared/logger.js";

const DEFAULT_SYNC_LIMIT = Number(process.env.ACTIVITY_SYNC_LIMIT ?? 500);

export class SubmissionSyncJob {
  constructor(
    private readonly submissionSyncService: SubmissionActivitySyncService = new SubmissionActivitySyncService()
  ) {}

  async execute(limit: number = DEFAULT_SYNC_LIMIT): Promise<void> {
    logger.info("Submission activity synchronization started.");

    try {
      const summary = await this.submissionSyncService.syncDueSubmissionActivity(limit);

      logger.info(`Submission activity synchronization completed in ${summary.durationMs} ms.`);

      logger.info(`Profiles processed: ${summary.profilesProcessed}`);

      logger.info(`Total submissions fetched: ${summary.totalSubmissionFetched}`);
    } catch (error) {
      logger.error("Submission activity synchronization failed.", {
        error,
      });
    }
  }
}
