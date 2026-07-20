import type { ContestProvider } from "../../providers/contest.provider.js";
import type { NormalizedContest } from "../../contest.types.js";

import type {
  LeetcodeContest,
  LeetcodeError,
  LeetcodeErrorLocation,
  LeetcodeResponse,
} from "./leetcode.types.js";
import { isValidContest } from "./leetcode.types.js";

import { ContestPlatform, ContestStatus } from "../../../../../generated/prisma/client.js";

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql/";

const UPCOMING_CONTESTS_QUERY = `
  query contestV2UpcomingContests {
    contestV2UpcomingContests {
      titleSlug
      title
      startTime
      duration
    }
  }
`;
export class LeetcodeAdapter implements ContestProvider {
  async fetchUpcomingContests(): Promise<NormalizedContest[]> {
    let res: Response;

    try {
      res = await fetch(LEETCODE_GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operationName: "contestV2UpcomingContests",
          query: UPCOMING_CONTESTS_QUERY,
          variables: {},
        }),
        signal: AbortSignal.timeout(10_000),
      });
    } catch (error) {
      throw new Error("Leetcode provider request failed", {
        cause: error,
      });
    }

    if (!res.ok) {
      throw new Error(`Leetcode provider request failed with status ${res.status}`);
    }

    let result: LeetcodeResponse;

    try {
      result = (await res.json()) as LeetcodeResponse;
    } catch (error) {
      throw new Error("Leetcode provider returned invalid JSON", {
        cause: error,
      });
    }

    if (result.errors?.length) {
      const errorMessages = result.errors.map((error) => error.message).join(", ");

      throw new Error(`Leetcode GraphQL request failed: ${errorMessages}`);
    }

    const contests = result.data?.contestV2UpcomingContests;

    if (!contests) {
      throw new Error("Leetcode contest data is missing");
    }

    const validContests = contests.filter(isValidContest);

    const now = Date.now();

    const upcomingContests = validContests.filter((contest) => contest.startTime * 1000 > now);

    const normalizedContests: NormalizedContest[] = upcomingContests.map((contest) => {
      const startTime = new Date(contest.startTime * 1000);

      const endTime = new Date(startTime.getTime() + contest.duration * 1000);

      let contestType: string | null = null;

      if (contest.titleSlug.startsWith("biweekly-contest-")) {
        contestType = "BIWEEKLY";
      } else if (contest.titleSlug.startsWith("weekly-contest-")) {
        contestType = "WEEKLY";
      }

      return {
        platform: ContestPlatform.LEETCODE,
        contestId: contest.titleSlug,
        title: contest.title,
        slug: contest.titleSlug,
        url: `https://leetcode.com/contest/${contest.titleSlug}/`,
        startTime,
        endTime,
        duration: contest.duration,
        registrationOpen: null,
        contestType,
        status: ContestStatus.UPCOMING,
      };
    });

    return normalizedContests;
  }
}
