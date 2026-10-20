import { logger } from "../../common/shared/logger.js";
import { ContestStatus } from "../../../generated/prisma/enums.js";
import {
  getUpcomingContestsForReminder,
  getUsersForContestReminders,
} from "./contest-reminder-eligibility.repository.js";
import { DEFAULT_NOTIFICATION_PREFERENCE } from "../notification-preference/notification-preference.service.js";
import type {
  ContestReminderCandidate,
  ContestReminderContest,
  ContestReminderEvaluationResult,
  ContestReminderUser,
} from "./contest-reminder-eligibility.types.js";

export const DEFAULT_REMINDER_WINDOW_MINUTES = 5;

export interface ContestReminderRepositoryDependencies {
  getUpcomingContestsForReminder: (now: Date) => Promise<ContestReminderContest[]>;
  getUsersForContestReminders: () => Promise<ContestReminderUser[]>;
}

export interface ContestReminderEvaluationOptions {
  reminderWindowMinutes?: number;
}

const defaultRepository: ContestReminderRepositoryDependencies = {
  getUpcomingContestsForReminder,
  getUsersForContestReminders,
};

const isUpcomingAt = (contest: ContestReminderContest, now: Date): boolean =>
  contest.status === ContestStatus.UPCOMING && contest.startTime.getTime() > now.getTime();

/**
 * A scheduler run is allowed to pick a reminder after its target time, for one
 * scheduler interval. This avoids missing contests whose target falls between
 * two five-minute runs while keeping the configured reminder time meaningful.
 */
export const isWithinReminderWindow = (
  contest: ContestReminderContest,
  reminderBeforeMinutes: number,
  now: Date,
  reminderWindowMinutes: number = DEFAULT_REMINDER_WINDOW_MINUTES
): boolean => {
  if (!Number.isFinite(reminderBeforeMinutes) || reminderBeforeMinutes <= 0) {
    return false;
  }

  if (!Number.isFinite(reminderWindowMinutes) || reminderWindowMinutes <= 0) {
    return false;
  }

  const reminderAt = contest.startTime.getTime() - reminderBeforeMinutes * 60_000;
  const nowMs = now.getTime();
  const windowEnd = reminderAt + reminderWindowMinutes * 60_000;

  return reminderAt <= nowMs && nowMs <= windowEnd;
};

const hasLinkedAccountForPlatform = (
  user: ContestReminderUser,
  platform: ContestReminderContest["platform"]
): boolean => user.linkedPlatformAccounts.some((account) => account.platform === platform);

const createCandidate = (
  user: ContestReminderUser,
  contest: ContestReminderContest,
  reminderBeforeMinutes: number
): ContestReminderCandidate => ({
  userId: user.id,
  email: user.email,
  firstName: user.firstName,
  contest: {
    id: contest.id,
    title: contest.title,
    url: contest.url,
    startTime: contest.startTime,
    endTime: contest.endTime,
    platform: contest.platform,
  },
  reminderAt: new Date(contest.startTime.getTime() - reminderBeforeMinutes * 60_000),
});

export class ContestReminderEligibilityService {
  constructor(
    private readonly repository: ContestReminderRepositoryDependencies = defaultRepository,
    private readonly reminderWindowMinutes: number = DEFAULT_REMINDER_WINDOW_MINUTES
  ) {}

  async evaluate(
    now: Date = new Date(),
    options: ContestReminderEvaluationOptions = {}
  ): Promise<ContestReminderEvaluationResult> {
    const reminderWindowMinutes = options.reminderWindowMinutes ?? this.reminderWindowMinutes;
    logger.info("Starting contest reminder eligibility evaluation...");

    const [contests, users] = await Promise.all([
      this.repository.getUpcomingContestsForReminder(now),
      this.repository.getUsersForContestReminders(),
    ]);
    const futureContests = contests.filter((contest) => isUpcomingAt(contest, now));
    const candidates: ContestReminderCandidate[] = [];

    for (const contest of futureContests) {
      for (const user of users) {
        const preference = user.notificationPreference ?? DEFAULT_NOTIFICATION_PREFERENCE;

        if (!preference.notificationsEnabled) {
          continue;
        }

        if (!preference.enabledPlatforms.includes(contest.platform)) {
          continue;
        }

        if (!hasLinkedAccountForPlatform(user, contest.platform)) {
          continue;
        }

        if (
          !isWithinReminderWindow(
            contest,
            preference.reminderBeforeMinutes,
            now,
            reminderWindowMinutes
          )
        ) {
          continue;
        }

        candidates.push(createCandidate(user, contest, preference.reminderBeforeMinutes));
      }
    }

    logger.info("Contest reminder eligibility evaluation completed.", {
      processedContests: futureContests.length,
      processedUsers: users.length,
      candidates: candidates.length,
    });

    return {
      candidates,
      processedContests: futureContests.length,
      processedUsers: users.length,
    };
  }

  async findEligibleCandidates(
    now: Date = new Date(),
    options?: ContestReminderEvaluationOptions
  ): Promise<ContestReminderCandidate[]> {
    const result = await this.evaluate(now, options);
    return result.candidates;
  }
}

export const contestReminderEligibilityService = new ContestReminderEligibilityService();

export const evaluateContestReminderEligibility = async (
  now: Date = new Date(),
  options?: ContestReminderEvaluationOptions
): Promise<ContestReminderEvaluationResult> =>
  contestReminderEligibilityService.evaluate(now, options);

export const findEligibleContestReminderCandidates = async (
  now: Date = new Date(),
  options?: ContestReminderEvaluationOptions
): Promise<ContestReminderCandidate[]> =>
  contestReminderEligibilityService.findEligibleCandidates(now, options);
