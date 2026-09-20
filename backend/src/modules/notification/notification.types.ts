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

export interface NotificationDeliveryRequest {
  userId: string;
  platform: ContestPlatform;
  notificationType: NotificationType;
  lastActivityAt: Date;
  inactiveDays: number;
}

export interface NotificationProcessingResult {
  requests: NotificationDeliveryRequest[];
  processedCandidates: number;
  generatedRequests: number;
  skippedSameCycle: number;
}
