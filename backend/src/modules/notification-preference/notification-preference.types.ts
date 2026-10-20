import type { ContestPlatform } from "../../../generated/prisma/enums.js";

export interface NotificationPreferenceDto {
  notificationsEnabled?: boolean;
  /** API alias accepted for clients following the ticket example. */
  platforms?: ContestPlatform[];
  enabledPlatforms?: ContestPlatform[];
  reminderBeforeMinutes?: number;
}

export interface NotificationPreferenceResponse {
  notificationsEnabled: boolean;
  /** Canonical ticket-facing name; enabledPlatforms remains for compatibility. */
  platforms: ContestPlatform[];
  enabledPlatforms: ContestPlatform[];
  reminderBeforeMinutes: number;
}
