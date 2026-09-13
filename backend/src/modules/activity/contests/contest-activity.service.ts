import { ContestPlatform } from "../../../../generated/prisma/enums.js";
import { ContestActivitySyncService } from "./contest-activity-sync.service.js";
import {
  findParticipationsByUserId,
  findLatestParticipation,
  countParticipations,
} from "./contest-activity.repository.js";
import type { ContestActivitySyncSummary, ContestParticipation } from "./contest-activity.types.js";

export class ContestActivityService {
  constructor(
    private readonly contestActivitySyncService: ContestActivitySyncService = new ContestActivitySyncService()
  ) {}

  /**
   * Retrieve contest participation history for a user, optionally filtered by platform.
   */
  async getUserContestActivity(
    userId: string,
    platform?: ContestPlatform
  ): Promise<ContestParticipation[]> {
    return findParticipationsByUserId(userId, platform);
  }

  /**
   * Retrieve the latest contest participation for a user on a given platform.
   */
  async getLatestParticipation(
    userId: string,
    platform: ContestPlatform
  ): Promise<ContestParticipation | null> {
    return findLatestParticipation(userId, platform);
  }

  /**
   * Get total contest participations for a user, optionally filtered by platform.
   */
  async getParticipationCount(userId: string, platform?: ContestPlatform): Promise<number> {
    return countParticipations(userId, platform);
  }

  /**
   * Trigger contest activity synchronization for a specific user.
   */
  async syncUserContestActivity(userId: string): Promise<ContestActivitySyncSummary> {
    return this.contestActivitySyncService.syncUserContestActivity(userId);
  }

  /**
   * Trigger contest activity synchronization across all linked accounts.
   */
  async syncAllContestActivity(): Promise<ContestActivitySyncSummary> {
    return this.contestActivitySyncService.syncAllContestActivity();
  }
}

export const contestActivityService = new ContestActivityService();
