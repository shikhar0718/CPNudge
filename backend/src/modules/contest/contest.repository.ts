import { prisma } from "../../common/database/prisma.js";
import type { NormalizedContest } from "./contest.types.js";

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
