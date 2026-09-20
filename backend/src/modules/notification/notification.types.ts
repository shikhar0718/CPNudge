import type { ContestPlatform, NotificationType } from "../../../generated/prisma/enums.js";

export type { ContestPlatform, NotificationType };

export interface NotificationHistoryRecord {
  id: string;
  userId: string;
  platform: ContestPlatform;
  notificationType: NotificationType;
  sentAt: Date;
  createdAt: Date;
}

export interface CountNotificationsOptions {
  platform?: ContestPlatform;
  notificationType?: NotificationType;
}
