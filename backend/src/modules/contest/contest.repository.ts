import { prisma } from "../../common/database/prisma.js";
import type { NormalizedContest } from "./contest.types.js";
import { ContestStatus } from "../../../generated/prisma/enums.js";

function toContestPersistenceData(contest: NormalizedContest) {
  return {
    platform: contest.platform,
    contestId: contest.contestId,
    title: contest.title,
    slug: contest.slug,
    url: contest.url,
    startTime: contest.startTime,
    endTime: contest.endTime,
    duration: contest.duration,
    registrationOpen: contest.registrationOpen,
    contestType: contest.contestType,
    status: contest.status,
  };
}

export async function upsertContest(contest: NormalizedContest) {
  const contestData = toContestPersistenceData(contest);

  return prisma.contest.upsert({
    where: {
      platform_contestId: {
        platform: contest.platform,
        contestId: contest.contestId,
      },
    },
    create: contestData,
    update: contestData,
  });
}

export async function upsertManyContests(contests: NormalizedContest[]) {
  for (const contest of contests) {
    await upsertContest(contest);
  }
}

export async function findUpcoming(limit?: number) {
  return prisma.contest.findMany({
    where: {
      status: ContestStatus.UPCOMING,
    },
    orderBy: {
      startTime: "asc",
    },
    ...(limit && {
      take: limit,
    }),
  });
}

export async function findById(id: string) {
  return prisma.contest.findUnique({
    where: {
      id: id,
    },
  });
}
