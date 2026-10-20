import type { ContestPlatform, ContestStatus } from "../../../generated/prisma/enums.js";
import type { ContestReminderData } from "../email/templates/contest-reminder.template.js";

export interface ContestReminderContest {
  id: string;
  platform: ContestPlatform;
  title: string;
  url: string;
  startTime: Date;
  endTime: Date;
  status: ContestStatus;
}

export interface ContestReminderPreference {
  notificationsEnabled: boolean;
  enabledPlatforms: ContestPlatform[];
  reminderBeforeMinutes: number;
}

export interface ContestReminderUser {
  id: string;
  email: string;
  firstName: string;
  notificationPreference: ContestReminderPreference | null;
  linkedPlatformAccounts: { platform: ContestPlatform }[];
}

export interface ContestReminderCandidate {
  userId: string;
  email: string;
  firstName: string;
  contest: ContestReminderData & {
    id: string;
    platform: ContestPlatform;
    endTime: Date;
  };
  reminderAt: Date;
}

export interface ContestReminderEvaluationResult {
  candidates: ContestReminderCandidate[];
  processedContests: number;
  processedUsers: number;
}

export type ContestReminderEligibilityResult = ContestReminderEvaluationResult;
