import { ContestSyncService } from "../contest/contest-sync.service.js";
import { logger } from "../../common/shared/logger.js";

export class ContestSyncJob {
  constructor(private readonly contestSyncService: ContestSyncService) {}

  async execute(): Promise<void> {
    logger.info("Contest synchronization started.");

    try {
      const summary = await this.contestSyncService.syncContests();

      logger.info(`Contest synchronization completed in ${summary.durationMs} ms.`);

      logger.info(`Total contests fetched: ${summary.totalContestFetched}`);

      for (const provider of summary.providerResults) {
        if (provider.success) {
          logger.info(`${provider.platform}: ${provider.noOfContestFetched} contests fetched.`);
        } else {
          logger.warn(`${provider.platform}: ${provider.error}`);
        }
      }
    } catch (error) {
      logger.error("Contest synchronization failed.", {
        error,
      });
    }
  }
}
