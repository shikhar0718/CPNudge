import { prisma } from "../../../common/database/index.js";
import type { ContestPlatform, User } from "../../../../generated/prisma/client.js";
import type {
  ContestParticipation,
  UpsertContestActivityParams,
} from "./contest-activity.types.js";
import { logger } from "../../../common/shared/logger.js";

export const upsertContestActivity = async (
  userId: string,
  participantData: UpsertContestActivityParams
) => {
  return prisma.contestParticipationActivity.upsert({
    where: {
      userId_platform_contestId: {
        userId,
        platform: participantData.platform,
        contestId: participantData.contestId,
      },
    },

    update: {
      contestName: participantData.contestName,
      participatedAt: participantData.participatedAt,
    },

    create: {
      userId,
      platform: participantData.platform,
      contestId: participantData.contestId,
      contestName: participantData.contestName,
      participatedAt: participantData.participatedAt,
    },
  });
};

export const upsertManyContestActivity = async (
  userId: string,
  participantsData: UpsertContestActivityParams[]
) => {
  try {
    for (const participantData of participantsData) {
      await upsertContestActivity(userId, participantData);
    }

    logger.info("Stored contest participation records", {
      userId,
      count: participantsData.length,
    });
  } catch (error) {
    logger.error("Failed to persist contest participation records", {
      err: error,
      userId,
    });

    throw error;
  }
};

/**
 * Retrieve latest contest participation for a user/platform.
 */
export const findLatestParticipation = async (
  userId: string,
  platform: ContestPlatform
): Promise<ContestParticipation | null> => {
  return prisma.contestParticipationActivity.findFirst({
    where: {
      userId,
      platform,
    },
    orderBy: {
      participatedAt: "desc",
    },
  });
};

/**
 * Count total contest participations for a user, optionally filtered by platform.
 */
export const countParticipations = async (
  userId: string,
  platform?: ContestPlatform
): Promise<number> => {
  return prisma.contestParticipationActivity.count({
    where: {
      userId,
      ...(platform && { platform }),
    },
  });
};

/**
 * Retrieve contest participations for a user, optionally filtered by platform,
 * ordered by participation date descending.
 */
export const findParticipationsByUserId = async (
  userId: string,
  platform?: ContestPlatform
): Promise<ContestParticipation[]> => {
  return prisma.contestParticipationActivity.findMany({
    where: {
      userId,
      ...(platform && { platform }),
    },
    orderBy: {
      participatedAt: "desc",
    },
  });
};

// Aliases matching conventions in submission activity and general repository access
export const getContestActivityByUser = findParticipationsByUserId;
export const findByUserId = findParticipationsByUserId;
export const upsertManyParticipations = upsertManyContestActivity;

/**
 * Retrieve linked platform accounts for contest synchronization.
 */
export const getLinkedAccountsForContestSync = async (userId?: string) => {
  return prisma.linkedPlatformAccount.findMany({
    where: {
      ...(userId && { userId }),
    },
    select: {
      id: true,
      userId: true,
      platform: true,
      username: true,
      lastContestParticipationDate: true,
    },
  });
};

/**
 * Update the last contest participation date and last sync timestamp for a linked account.
 */
export const updateLastContestAt = async (
  userId: string,
  platform: ContestPlatform,
  lastContestAt: Date
) => {
  return prisma.linkedPlatformAccount.update({
    where: {
      userId_platform: {
        userId,
        platform,
      },
    },
    data: {
      lastContestParticipationDate: lastContestAt,
      lastSuccessfulSyncAt: new Date(),
    },
  });
};

/**
 * Update sync status and metadata for a linked platform account.
 */
export const updateLinkedProfileContestSync = async (
  userId: string,
  platform: ContestPlatform,
  data: {
    lastContestParticipationDate?: Date | null;
    lastContestAt?: Date | null;
    lastSuccessfulSyncAt?: Date;
    nextSyncAt?: Date | null;
  }
) => {
  const lastDate = data.lastContestParticipationDate ?? data.lastContestAt;
  return prisma.linkedPlatformAccount.update({
    where: {
      userId_platform: {
        userId,
        platform,
      },
    },
    data: {
      ...(data.lastSuccessfulSyncAt !== undefined && {
        lastSuccessfulSyncAt: data.lastSuccessfulSyncAt,
      }),
      ...(lastDate !== undefined && {
        lastContestParticipationDate: lastDate,
      }),
      ...(data.nextSyncAt !== undefined && {
        nextSyncAt: data.nextSyncAt,
      }),
    },
  });
};

/**
 * Find user by ID.
 */
export const findUserById = async (userId: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
};
