import { logger } from "../../../common/shared/logger.js";
import { ContestPlatform } from "../../../../generated/prisma/enums.js";
import { profileProviderRegistry } from "../../profile/providers/profile-provider.registry.js";
import type { ProfileProvider } from "../../profile/providers/profile-provider.interface.js";
import {
  getLinkedAccountsForContestSync,
  upsertManyParticipations,
  updateLastContestAt,
  updateLinkedProfileContestSync,
} from "./contest-activity.repository.js";
import type {
  ContestActivitySyncSummary,
  LinkedAccountForSync,
  UpsertContestActivityParams,
} from "./contest-activity.types.js";

export interface ContestActivityRepositoryDependencies {
  getLinkedAccountsForContestSync: (userId?: string) => Promise<LinkedAccountForSync[]>;
  upsertManyParticipations: (
    userId: string,
    participations: UpsertContestActivityParams[]
  ) => Promise<void>;
  updateLastContestAt: (
    userId: string,
    platform: ContestPlatform,
    lastContestAt: Date
  ) => Promise<unknown>;
  updateLinkedProfileContestSync?: (
    userId: string,
    platform: ContestPlatform,
    data: {
      lastContestParticipationDate?: Date | null;
      lastContestAt?: Date | null;
      lastSuccessfulSyncAt?: Date;
      nextSyncAt?: Date | null;
    }
  ) => Promise<unknown>;
}

export class ContestActivitySyncService {
  constructor(
    private readonly repository: ContestActivityRepositoryDependencies = {
      getLinkedAccountsForContestSync,
      upsertManyParticipations,
      updateLastContestAt,
      updateLinkedProfileContestSync,
    },
    private readonly registry: {
      get: (platform: ContestPlatform) => ProfileProvider | undefined;
    } = profileProviderRegistry
  ) {}

  /**
   * Synchronize contest participation for a single linked profile.
   */
  public async syncSingleProfile(account: {
    userId: string;
    platform: ContestPlatform;
    username: string;
  }): Promise<{ success: boolean; participationsStored: number }> {
    const provider = this.registry.get(account.platform);

    if (!provider || !provider.supports(account.platform)) {
      logger.debug(`No supported provider found for platform ${account.platform}`);
      return { success: true, participationsStored: 0 };
    }

    if (typeof provider.fetchContestParticipation !== "function") {
      logger.debug(
        `Platform ${account.platform} does not support contest participation tracking (user ${account.userId})`
      );
      return { success: true, participationsStored: 0 };
    }

    try {
      logger.info(`Syncing contest participation for ${account.platform}: ${account.username}`);
      const participations = await provider.fetchContestParticipation(account.username);

      let participationsStored = 0;
      let latestParticipationDate: Date | null = null;

      if (participations && participations.length > 0) {
        for (const item of participations) {
          const itemDate = new Date(item.participatedAt);
          if (!latestParticipationDate || itemDate > latestParticipationDate) {
            latestParticipationDate = itemDate;
          }
        }

        await this.repository.upsertManyParticipations(account.userId, participations);
        participationsStored = participations.length;

        logger.info(
          `Stored ${participations.length} contest participations for user ${account.userId}`
        );
      }

      // Empty participation history: do not overwrite lastContestAt with null, keep existing value
      if (latestParticipationDate) {
        await this.repository.updateLastContestAt(
          account.userId,
          account.platform,
          latestParticipationDate
        );
      }

      return { success: true, participationsStored };
    } catch (error) {
      logger.error(
        `Failed to sync contest participation for ${account.platform}: ${account.username}`,
        { error }
      );
      return { success: false, participationsStored: 0 };
    }
  }

  /**
   * Synchronize a list of linked profiles with error isolation and progress tracking.
   */
  public async syncProfiles(accounts: LinkedAccountForSync[]): Promise<ContestActivitySyncSummary> {
    const startedAt = new Date();
    logger.info("Starting contest participation synchronization...");

    // Filtering: Only process platforms where fetchContestParticipation() exists and provider supports platform
    const eligibleAccounts = accounts.filter((account) => {
      const provider = this.registry.get(account.platform);
      if (!provider || !provider.supports(account.platform)) {
        logger.debug(`No supported provider found for platform ${account.platform}`);
        return false;
      }
      if (typeof provider.fetchContestParticipation !== "function") {
        logger.debug(
          `Platform ${account.platform} does not support contest participation tracking (user ${account.userId})`
        );
        return false;
      }
      return true;
    });

    let processedAccounts = 0;
    let successfulAccounts = 0;
    let failedAccounts = 0;
    let totalParticipationsStored = 0;

    for (const account of eligibleAccounts) {
      processedAccounts++;
      const result = await this.syncSingleProfile(account);
      if (result.success) {
        successfulAccounts++;
        totalParticipationsStored += result.participationsStored;
      } else {
        failedAccounts++;
      }
    }

    const completedAt = new Date();
    const durationMs = completedAt.getTime() - startedAt.getTime();
    logger.info("Contest participation synchronization completed.");

    return {
      processedAccounts,
      successfulAccounts,
      failedAccounts,
      totalParticipationsStored,
      startedAt,
      completedAt,
      durationMs,
    };
  }

  /**
   * Synchronize contest participations for all users or a specific user.
   */
  public async syncContestParticipation(userId?: string): Promise<ContestActivitySyncSummary> {
    const accounts = await this.repository.getLinkedAccountsForContestSync(userId);
    return this.syncProfiles(accounts);
  }

  /**
   * Synchronize contest participations for a specific user.
   */
  public async syncUserContestActivity(userId: string): Promise<ContestActivitySyncSummary> {
    return this.syncContestParticipation(userId);
  }

  /**
   * Synchronize contest participations for all linked accounts.
   */
  public async syncAllContestActivity(): Promise<ContestActivitySyncSummary> {
    return this.syncContestParticipation();
  }
}
