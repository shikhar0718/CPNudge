import { prisma } from "../../common/database/index.js";
import { ContestStatus } from "../../../generated/prisma/enums.js";

export const getUpcomingContestsForReminder = async (now: Date = new Date()) =>
  prisma.contest.findMany({
    where: {
      status: ContestStatus.UPCOMING,
      startTime: { gt: now },
    },
    orderBy: { startTime: "asc" },
    select: {
      id: true,
      platform: true,
      title: true,
      url: true,
      startTime: true,
      endTime: true,
      status: true,
    },
  });

export const getUsersForContestReminders = async () =>
  prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      notificationPreference: {
        select: {
          notificationsEnabled: true,
          enabledPlatforms: true,
          reminderBeforeMinutes: true,
        },
      },
      linkedPlatformAccounts: {
        select: { platform: true },
      },
    },
  });
