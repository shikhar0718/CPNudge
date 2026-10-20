import type {
  ContestPlatform,
  NotificationDeliveryStatus,
  NotificationType,
} from "../../../generated/prisma/enums.js";

export type { NotificationDeliveryStatus };

// ── CP-030: Notification History API ──────────────────────────────

export interface NotificationHistoryQuery {
  page: number;
  limit: number;
  platform?: ContestPlatform | undefined;
  status?: NotificationDeliveryStatus | undefined;
}

export interface NotificationHistoryItem {
  id: string;
  notificationType: NotificationType;
  platform: ContestPlatform;
  contestId: string | null;
  status: NotificationDeliveryStatus;
  sentAt: Date | null;
  createdAt: Date;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface NotificationHistoryResponse {
  notifications: NotificationHistoryItem[];
  pagination: PaginationMeta;
}

export type { ContestPlatform, NotificationType };

export interface NotificationHistoryRecord {
  id: string;
  userId: string;
  contestId: string | null;
  platform: ContestPlatform;
  notificationType: NotificationType;
  reminderBeforeMinutes: number | null;
  deliveryStatus: NotificationDeliveryStatus;
  claimedAt: Date | null;
  sentAt: Date | null;
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
