import { ContestPlatform, ContestStatus } from "../../../../../generated/prisma/client.js";
import type { NormalizedContest } from "../../contest.types.js";
import type { AtCoderContestRecord } from "./atcoder.types.js";
import { parseAtCoderDuration, parseAtCoderStartTime } from "./atcoder.parser.js";

const ATCODER_BASE_URL = "https://atcoder.jp";

export const normalizeAtCoderContest = (contest: AtCoderContestRecord): NormalizedContest => {
  const startTime = parseAtCoderStartTime(contest.startTimeText);
  const duration = parseAtCoderDuration(contest.durationText);
  const endTime = new Date(startTime.getTime() + duration * 1000);

  const contestTypeCode = contest.contestId.match(/^[A-Za-z]+/)?.[0].toUpperCase();

  const contestTypeMap: Record<string, string> = {
    ABC: "AtCoder Beginner Contest",
    ARC: "AtCoder Regular Contest",
    AGC: "AtCoder Grand Contest",
    AHC: "AtCoder Heuristic Contest",
  };

  const contestType = contestTypeCode ? (contestTypeMap[contestTypeCode] ?? null) : null;

  const contestUrl = new URL(contest.href, ATCODER_BASE_URL).toString();

  return {
    platform: ContestPlatform.ATCODER,
    contestId: contest.contestId,
    title: contest.title,
    slug: contest.contestId,
    url: contestUrl,
    startTime,
    endTime,
    duration,
    registrationOpen: null,
    contestType,
    status: ContestStatus.UPCOMING,
  };
};
