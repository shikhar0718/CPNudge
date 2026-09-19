import { ContestActivitySyncService } from "../activity/contests/contest-activity-sync.service.js";
import { logger } from "../../common/shared/logger.js";

export class ContestParticipationSyncJob {
  private isRunning = false;

  constructor(
    private readonly contestParticipationSyncService: ContestActivitySyncService = new ContestActivitySyncService()
  ) {}

  /**
   * Execute contest participation synchronization with concurrency protection and metrics logging.
   */
  async execute(): Promise<void> {
    if (this.isRunning) {
      logger.warn(
        "Contest participation synchronization skipped because another execution is already in progress."
      );
      return;
    }

    this.isRunning = true;
    logger.info("Contest participation synchronization started.");
    const startTime = Date.now();

    try {
      const summary = await this.contestParticipationSyncService.syncAllContestActivity();
      const durationMs = Date.now() - startTime;

      logger.info(`Contest participation synchronization completed in ${durationMs} ms.`);
      logger.info(`Processed Accounts: ${summary.processedAccounts}`);
      logger.info(`Successful Accounts: ${summary.successfulAccounts}`);
      logger.info(`Failed Accounts: ${summary.failedAccounts}`);
      logger.info(`Stored Participations: ${summary.totalParticipationsStored}`);
    } catch (error) {
      logger.error("Contest participation synchronization failed.", {
        error,
      });
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Manual execution entrypoint independent of scheduler.
   */
  async run(): Promise<void> {
    return this.execute();
  }
}
