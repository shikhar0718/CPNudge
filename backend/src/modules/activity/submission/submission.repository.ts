import { prisma } from "../../../common/database/index.js";
import type { ContestPlatform } from "../../../../generated/prisma/client.js";

export interface UpsertSubmissionActivityParams {
  userId: string;
  platform: ContestPlatform;
  activityDate: Date;
  submissionCount: number;
}

export const upsertSubmissionActivity = async (data: UpsertSubmissionActivityParams) => {
  return await prisma.submissionActivity.upsert({
    where: {
      userId_platform_activityDate: {
        userId: data.userId,
        platform: data.platform,
        activityDate: data.activityDate,
      },
    },
    update: {
      submissionCount: data.submissionCount,
    },
    create: {
      userId: data.userId,
      platform: data.platform,
      activityDate: data.activityDate,
      submissionCount: data.submissionCount,
    },
  });
};

export const getSubmissionActivityByUser = async (userId: string, platform?: ContestPlatform) => {
  return await prisma.submissionActivity.findMany({
    where: {
      userId,
      ...(platform && { platform }),
    },
    orderBy: {
      activityDate: "desc",
    },
  });
};

export const upsertManySubmissionActivity = async (
  activities: UpsertSubmissionActivityParams[]
) => {
  const results = [];
  for (const activity of activities) {
    const res = await upsertSubmissionActivity(activity);
    results.push(res);
  }
  return results;
};
