import * as repository from "./notification-history.repository.js";
import type {
  NotificationHistoryQuery,
  NotificationHistoryItem,
  NotificationHistoryResponse,
} from "./notification.types.js";

type HistoryRepository = Pick<typeof repository, "findNotificationHistory">;

const toHistoryItem = (
  record: repository.FindNotificationHistoryResult["records"][number]
): NotificationHistoryItem => ({
  id: record.id,
  notificationType: record.notificationType,
  platform: record.platform,
  contestId: record.contestId,
  status: record.deliveryStatus,
  sentAt: record.sentAt,
  createdAt: record.createdAt,
});

export const getNotificationHistory = async (
  userId: string,
  query: NotificationHistoryQuery,
  repo: HistoryRepository = repository
): Promise<NotificationHistoryResponse> => {
  const { page, limit, platform, status } = query;

  const { records, total } = await repo.findNotificationHistory({
    userId,
    page,
    limit,
    platform,
    status,
  });

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    notifications: records.map(toHistoryItem),
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};
