import { logger } from "../../../common/shared/logger.js";
import type { SubmissionActivitySyncSummary } from "./submission-sync.types.js";
import { ContestPlatform } from "../../../../generated/prisma/enums.js";
import { getProfilesDueForSync, getUserLinkedProfiles } from "../../profile/profile.repository.js";
import { profileProviderRegistry } from "../../profile/providers/profile-provider.registry.js";
import { upsertManyActivities, updateLinkedProfileActivitySync } from "./submission.repository.js";

const BATCH_SIZE = 20;
const SYNC_INTERVAL_HOURS = 6;

export class SubmissionActivitySyncService {
  private async syncSingleProfile(account: {
    userId: string;
    platform: ContestPlatform;
    username: string;
  }): Promise<{ submissionsFetched: number; recordsStored: number }> {
    const provider = profileProviderRegistry.get(account.platform);

    if (!provider || !provider.supports(account.platform)) {
      logger.debug(`No supported provider found for platform ${account.platform}`);
      return { submissionsFetched: 0, recordsStored: 0 };
    }

    if (typeof provider.fetchActivity !== "function") {
      logger.debug(
        `Platform ${account.platform} does not support activity tracking (user ${account.userId})`
      );
      return { submissionsFetched: 0, recordsStored: 0 };
    }

    try {
      logger.info(`Syncing activity for ${account.platform}: ${account.username}`);
      const activities = await provider.fetchActivity(account.username);

      let totalSubmissions = 0;
      let latestActivityDate: Date | null = null;

      if (activities && activities.length > 0) {
        for (const act of activities) {
          totalSubmissions += act.submissionCount;
          const actDate = new Date(act.activityDate);
          if (!latestActivityDate || actDate > latestActivityDate) {
            latestActivityDate = actDate;
          }
        }

        await upsertManyActivities(account.userId, activities);
        logger.info(`Stored ${activities.length} activity records for user ${account.userId}`);
      }

      const nextSyncAt = new Date(Date.now() + SYNC_INTERVAL_HOURS * 60 * 60 * 1000);

      await updateLinkedProfileActivitySync(account.userId, account.platform, {
        lastSubmissionActivityDate: latestActivityDate,
        lastSuccessfulSyncAt: new Date(),
        nextSyncAt,
      });

      return {
        submissionsFetched: totalSubmissions,
        recordsStored: activities ? activities.length : 0,
      };
    } catch (error) {
      logger.error(`Failed to sync activity for ${account.platform}: ${account.username}`, {
        error,
      });
      return { submissionsFetched: 0, recordsStored: 0 };
    }
  }

  private async syncProfiles(
    linkedProfiles: { userId: string; platform: ContestPlatform; username: string }[]
  ): Promise<SubmissionActivitySyncSummary> {
    const startedAt = new Date();
    logger.info(
      `Starting submission activity synchronization for ${linkedProfiles.length} due profiles...`
    );

    const results: PromiseSettledResult<{ submissionsFetched: number; recordsStored: number }>[] =
      [];

    for (let i = 0; i < linkedProfiles.length; i += BATCH_SIZE) {
      const batch = linkedProfiles.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.allSettled(
        batch.map((account) => this.syncSingleProfile(account))
      );
      results.push(...batchResults);
    }

    let totalSubmissionFetched = 0;
    for (const result of results) {
      if (result.status === "fulfilled") {
        totalSubmissionFetched += result.value.submissionsFetched;
      }
    }

    const completedAt = new Date();
    const durationMs = completedAt.getTime() - startedAt.getTime();

    logger.info(
      `Activity synchronization completed in ${durationMs}ms. Processed ${linkedProfiles.length} profiles, fetched ${totalSubmissionFetched} submissions.`
    );

    return {
      startedAt,
      completedAt,
      durationMs,
      profilesProcessed: linkedProfiles.length,
      totalSubmissionFetched,
    };
  }

  async syncDueSubmissionActivity(limit: number = 500): Promise<SubmissionActivitySyncSummary> {
    const linkedProfiles = await getProfilesDueForSync(limit);
    return this.syncProfiles(linkedProfiles);
  }

  async syncUserSubmissionActivity(userId: string): Promise<SubmissionActivitySyncSummary> {
    const userProfiles = await getUserLinkedProfiles(userId);
    return this.syncProfiles(userProfiles);
  }
}
