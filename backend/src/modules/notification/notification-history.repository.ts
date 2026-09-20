import type { ContestPlatform, NotificationType } from "../../../generated/prisma/enums.js";
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
