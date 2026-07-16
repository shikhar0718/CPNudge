import cron from "node-cron";

import { env } from "../../common/config/env.js";
import { logger } from "../../common/shared/logger.js";

import { ContestSyncJob } from "./contest-sync.job.js";
import { ContestSyncService } from "../contest/contest-sync.service.js";

export class SchedulerService {
  private readonly contestSyncJob: ContestSyncJob;

  constructor() {
    const contestSyncService = new ContestSyncService();

    this.contestSyncJob = new ContestSyncJob(contestSyncService);
  }

  start(): void {
    logger.info("Starting scheduler...");

    cron.schedule(
      env.CONTEST_SYNC_CRON,
      async () => {
        await this.contestSyncJob.execute();
      },
      {
        noOverlap: true,
      }
    );

    logger.info(`Contest synchronization scheduled with cron expression: ${env.CONTEST_SYNC_CRON}`);
  }
}
