import { ContestStatus, type ContestPlatform } from "../../../generated/prisma/client.js";
import { prisma } from "../../common/database/index.js";
import type { NormalizedContest } from "./contest.types.js";

export const findContestByPlatformId = async (platform: ContestPlatform, contestId: string) => {
  return prisma.contest.findUnique({
    where: {
      platform_contestId: {
        platform,
        contestId,
      },
    },
  });
};

export const createContest = async (data: NormalizedContest) => {
  return prisma.contest.create({
    data,
  });
};

export const updateContest = async (data: NormalizedContest) => {
  return prisma.contest.update({
    where: {
      platform_contestId: {
        platform: data.platform,
        contestId: data.contestId,
      },
    },
    data,
  });
};

export const getUpcomingContests = async () => {
  return prisma.contest.findMany({
    where: {
      status: ContestStatus.UPCOMING,
    },
    orderBy: {
      startTime: "asc",
    },
  });
};
