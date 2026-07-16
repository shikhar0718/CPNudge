import { prisma } from "../../common/database/prisma.js";
import type { NormalizedContest } from "./contest.types.js";
import { ContestStatus } from "../../../generated/prisma/enums.js";
import type { ContestQueryDto } from "./dto/contest-query.dto.js";
import { Prisma } from "../../../generated/prisma/client.js";

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

export async function findContests(options: ContestQueryDto) {
  const { platform, status, search, sortBy, order, page, limit } = options;

  const where: Prisma.ContestWhereInput = {};

  if (platform) {
    where.platform = platform;
  }

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [total, contests] = await Promise.all([
    prisma.contest.count({ where }),
    prisma.contest.findMany({
      where,
      orderBy: {
        [sortBy]: order,
      },
      skip,
      take: limit,
    }),
  ]);

  return { total, contests };
}
