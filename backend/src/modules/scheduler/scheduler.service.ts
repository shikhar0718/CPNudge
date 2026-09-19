import cron from "node-cron";
import { logger } from "../../common/shared/logger.js";
import { ContestSyncJob } from "./contest-sync.job.js";
import { SubmissionSyncJob } from "./submission-sync.job.js";
import { ContestParticipationSyncJob } from "./contest-participation-sync.job.js";
import { ContestSyncService } from "../contest/contest-sync.service.js";

const CONTEST_SYNC_CRON = process.env.CONTEST_SYNC_CRON ?? "0 */6 * * *";

const ACTIVITY_SYNC_CRON = process.env.ACTIVITY_SYNC_CRON ?? "0 * * * *";

const CONTEST_PARTICIPATION_SYNC_CRON =
  process.env.CONTEST_PARTICIPATION_SYNC_CRON ?? "0 */12 * * *";

export class SchedulerService {
  private readonly contestSyncJob: ContestSyncJob;
  private readonly submissionSyncJob: SubmissionSyncJob;
  private readonly contestParticipationSyncJob: ContestParticipationSyncJob;

  constructor() {
    this.contestSyncJob = new ContestSyncJob(new ContestSyncService());
    this.submissionSyncJob = new SubmissionSyncJob();
    this.contestParticipationSyncJob = new ContestParticipationSyncJob();
  }

  start(): void {
    logger.info("Initializing background scheduler jobs...");

    cron.schedule(CONTEST_SYNC_CRON, async () => {
      await this.contestSyncJob.execute();
    });

    logger.info(`Contest synchronization scheduled with cron expression: ${CONTEST_SYNC_CRON}`);

    cron.schedule(ACTIVITY_SYNC_CRON, async () => {
      await this.submissionSyncJob.execute();
    });

    logger.info(
      `Submission activity synchronization scheduled with cron expression: ${ACTIVITY_SYNC_CRON}`
    );

    cron.schedule(CONTEST_PARTICIPATION_SYNC_CRON, async () => {
      await this.contestParticipationSyncJob.execute();
    });

    logger.info(
      `Contest participation synchronization scheduled with cron expression: ${CONTEST_PARTICIPATION_SYNC_CRON}`
    );

    logger.info("Scheduler service started.");
  }
}
