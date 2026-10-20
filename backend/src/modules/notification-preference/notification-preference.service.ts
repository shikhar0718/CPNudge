import { ContestPlatform } from "../../../generated/prisma/enums.js";
import type {
  NotificationPreferenceDto,
  NotificationPreferenceResponse,
} from "./notification-preference.types.js";
import * as repository from "./notification-preference.repository.js";

export const DEFAULT_NOTIFICATION_PREFERENCE: NotificationPreferenceResponse = {
  notificationsEnabled: true,
  platforms: Object.values(ContestPlatform),
  enabledPlatforms: Object.values(ContestPlatform),
  reminderBeforeMinutes: 60,
};

type PreferenceRepository = Pick<
  typeof repository,
  "findNotificationPreference" | "upsertNotificationPreference"
>;

type StoredPreference = Omit<NotificationPreferenceResponse, "platforms"> & {
  platforms?: ContestPlatform[];
};

const toResponse = (preference: StoredPreference): NotificationPreferenceResponse => ({
  notificationsEnabled: preference.notificationsEnabled,
  platforms: [...(preference.platforms ?? preference.enabledPlatforms)],
  enabledPlatforms: [...preference.enabledPlatforms],
  reminderBeforeMinutes: preference.reminderBeforeMinutes,
});

export const getNotificationPreference = async (
  userId: string,
  repo: PreferenceRepository = repository
): Promise<NotificationPreferenceResponse> => {
  const preference = await repo.findNotificationPreference(userId);
  return preference ? toResponse(preference) : toResponse(DEFAULT_NOTIFICATION_PREFERENCE);
};

export const updateNotificationPreference = async (
  userId: string,
  data: NotificationPreferenceDto,
  repo: PreferenceRepository = repository
): Promise<NotificationPreferenceResponse> => {
  const current = await getNotificationPreference(userId, repo);
  const enabledPlatforms = data.platforms ?? data.enabledPlatforms ?? current.enabledPlatforms;
  const next = {
    notificationsEnabled: data.notificationsEnabled ?? current.notificationsEnabled,
    enabledPlatforms,
    reminderBeforeMinutes: data.reminderBeforeMinutes ?? current.reminderBeforeMinutes,
  };
  const saved = await repo.upsertNotificationPreference(userId, next);
  return toResponse(saved);
};
