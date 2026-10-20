import { Prisma } from "../../../generated/prisma/client.js";
import type {
  ContestPlatform,
  NotificationDeliveryStatus,
  NotificationType,
} from "../../../generated/prisma/enums.js";
import { prisma } from "../../common/database/index.js";
import { logger } from "../../common/shared/logger.js";
import { NOTIFICATION_LOG_MESSAGES } from "./notification.constants.js";
import type { CountNotificationsOptions, NotificationHistoryRecord } from "./notification.types.js";

export const createNotificationHistory = async (
  userId: string,
  platform: ContestPlatform,
  notificationType: NotificationType
): Promise<NotificationHistoryRecord> => {
  try {
    const record = await prisma.notificationHistory.create({
      data: {
        userId,
        platform,
        notificationType,
      },
    });

    logger.info(NOTIFICATION_LOG_MESSAGES.RECORD_CREATED, {
      recordId: record.id,
      userId,
      platform,
      notificationType,
    });

    return record;
  } catch (error) {
    logger.error(NOTIFICATION_LOG_MESSAGES.RECORD_FAILED, {
      err: error,
      userId,
      platform,
      notificationType,
    });
    throw error;
  }
};

export interface ContestReminderNotificationIdentity {
  userId: string;
  contestId: string;
  platform: ContestPlatform;
  reminderBeforeMinutes: number;
}

export interface ContestReminderNotificationClaim {
  id: string;
}

const CONTEST_REMINDER_TYPE: NotificationType = "CONTEST_REMINDER";
const CONTEST_REMINDER_CLAIM_TTL_MS = 15 * 60 * 1000;

/**
 * Atomically claims a contest reminder through the database unique key.
 * Existing SENT rows are permanent duplicate prevention. A stale PENDING row
 * can be reclaimed after the TTL so a process crash does not suppress a
 * reminder forever.
 */
export const claimContestReminder = async (
  identity: ContestReminderNotificationIdentity,
  now: Date = new Date()
): Promise<ContestReminderNotificationClaim | null> => {
  try {
    const claim = await prisma.notificationHistory.create({
      data: {
        userId: identity.userId,
        contestId: identity.contestId,
        platform: identity.platform,
        notificationType: CONTEST_REMINDER_TYPE,
        reminderBeforeMinutes: identity.reminderBeforeMinutes,
        deliveryStatus: "PENDING",
        claimedAt: now,
      },
      select: { id: true },
    });

    return claim;
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) {
      throw error;
    }

    const existing = await prisma.notificationHistory.findFirst({
      where: {
        userId: identity.userId,
        contestId: identity.contestId,
        platform: identity.platform,
        notificationType: CONTEST_REMINDER_TYPE,
        reminderBeforeMinutes: identity.reminderBeforeMinutes,
      },
      select: { id: true, deliveryStatus: true, claimedAt: true },
    });

    if (!existing || existing.deliveryStatus === "SENT") {
      return null;
    }

    const staleBefore = new Date(now.getTime() - CONTEST_REMINDER_CLAIM_TTL_MS);
    if (!existing.claimedAt || existing.claimedAt > staleBefore) {
      return null;
    }

    const reclaimed = await prisma.notificationHistory.updateMany({
      where: {
        id: existing.id,
        deliveryStatus: "PENDING",
        claimedAt: existing.claimedAt,
      },
      data: { claimedAt: now },
    });

    return reclaimed.count === 1 ? { id: existing.id } : null;
  }
};

export const markContestReminderSent = async (
  id: string,
  sentAt: Date = new Date()
): Promise<void> => {
  await prisma.notificationHistory.updateMany({
    where: { id, deliveryStatus: "PENDING" },
    data: { deliveryStatus: "SENT", sentAt, claimedAt: null },
  });
};

export const releaseContestReminderClaim = async (id: string): Promise<void> => {
  await prisma.notificationHistory.deleteMany({
    where: { id, deliveryStatus: "PENDING" },
  });
};

//  Check if a notification of a specific type has already been sent to prevent duplicates.

export const hasNotificationBeenSent = async (
  userId: string,
  platform: ContestPlatform,
  notificationType: NotificationType
): Promise<boolean> => {
  try {
    const existing = await prisma.notificationHistory.findFirst({
      where: {
        userId,
        platform,
        notificationType,
      },
      select: {
        id: true,
      },
    });

    const alreadySent = Boolean(existing);

    logger.info(NOTIFICATION_LOG_MESSAGES.LOOKUP_COMPLETED, {
      userId,
      platform,
      notificationType,
      alreadySent,
    });

    return alreadySent;
  } catch (error) {
    logger.error("Failed to check if notification has been sent", {
      err: error,
      userId,
      platform,
      notificationType,
    });
    throw error;
  }
};

export const findLatestNotification = async (
  userId: string,
  platform: ContestPlatform
): Promise<NotificationHistoryRecord | null> => {
  try {
    const latest = await prisma.notificationHistory.findFirst({
      where: {
        userId,
        platform,
      },
      orderBy: {
        sentAt: "desc",
      },
    });

    logger.info(NOTIFICATION_LOG_MESSAGES.LOOKUP_COMPLETED, {
      userId,
      platform,
      found: Boolean(latest),
      lastSentAt: latest?.sentAt,
    });

    return latest;
  } catch (error) {
    logger.error("Failed to find latest notification", {
      err: error,
      userId,
      platform,
    });
    throw error;
  }
};

export const countNotifications = async (
  userId: string,
  options?: CountNotificationsOptions
): Promise<number> => {
  try {
    const count = await prisma.notificationHistory.count({
      where: {
        userId,
        ...(options?.platform && { platform: options.platform }),
        ...(options?.notificationType && { notificationType: options.notificationType }),
      },
    });

    logger.info(NOTIFICATION_LOG_MESSAGES.LOOKUP_COMPLETED, {
      userId,
      platform: options?.platform,
      notificationType: options?.notificationType,
      count,
    });

    return count;
  } catch (error) {
    logger.error("Failed to count notifications", {
      err: error,
      userId,
      options,
    });
    throw error;
  }
};

export const findLatestNotificationByType = async (
  userId: string,
  platform: ContestPlatform,
  notificationType: NotificationType
): Promise<NotificationHistoryRecord | null> => {
  try {
    const latest = await prisma.notificationHistory.findFirst({
      where: {
        userId,
        platform,
        notificationType,
      },
      orderBy: {
        sentAt: "desc",
      },
    });

    logger.info(NOTIFICATION_LOG_MESSAGES.LOOKUP_COMPLETED, {
      userId,
      platform,
      notificationType,
      found: Boolean(latest),
      lastSentAt: latest?.sentAt,
    });

    return latest;
  } catch (error) {
    logger.error("Failed to find latest notification by type", {
      err: error,
      userId,
      platform,
      notificationType,
    });

    throw error;
  }
};

// ── CP-030: Paginated notification history ───────────────────────

export interface FindNotificationHistoryOptions {
  userId: string;
  page: number;
  limit: number;
  platform?: ContestPlatform | undefined;
  status?: NotificationDeliveryStatus | undefined;
}

export interface FindNotificationHistoryResult {
  records: NotificationHistoryRecord[];
  total: number;
}

export const findNotificationHistory = async (
  options: FindNotificationHistoryOptions
): Promise<FindNotificationHistoryResult> => {
  const { userId, page, limit, platform, status } = options;

  const where = {
    userId,
    ...(platform && { platform }),
    ...(status && { deliveryStatus: status }),
  };

  const skip = (page - 1) * limit;

  try {
    const [records, total] = await prisma.$transaction([
      prisma.notificationHistory.findMany({
        where,
        orderBy: [{ sentAt: "desc" }, { createdAt: "desc" }, { id: "desc" }],
        skip,
        take: limit,
      }),
      prisma.notificationHistory.count({ where }),
    ]);

    logger.info("Notification history retrieved.", {
      userId,
      page,
      limit,
      platform,
      status,
      returned: records.length,
      total,
    });

    return { records, total };
  } catch (error) {
    logger.error("Failed to retrieve notification history.", {
      err: error,
      userId,
      page,
      limit,
      platform,
      status,
    });
    throw error;
  }
};
