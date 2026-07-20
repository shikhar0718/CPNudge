import { ContestPlatform, ContestStatus } from "../../../../../generated/prisma/client.js";

import type { NormalizedContest } from "../../contest.types.js";
import type { ContestProvider } from "../../providers/contest.provider.js";

import { CodeforcesProviderError } from "./codeforces.error.js";
import {
  hasStartTime,
  isCodeforcesContestListResponse,
  type CodeforcesContest,
} from "./codeforces.types.js";

const CODEFORCES_CONTEST_LIST_URL = "https://codeforces.com/api/contest.list?gym=false";

export class CodeforcesAdapter implements ContestProvider {
  async fetchUpcomingContests(): Promise<NormalizedContest[]> {
    try {
      const response = await fetch(CODEFORCES_CONTEST_LIST_URL);

      if (!response.ok) {
        throw new CodeforcesProviderError(`Codeforces API returned HTTP ${response.status}`);
      }

      const data: unknown = await response.json();

      if (!isCodeforcesContestListResponse(data)) {
        throw new CodeforcesProviderError("Unexpected Codeforces API response");
      }

      if (data.status !== "OK" || !data.result) {
        throw new CodeforcesProviderError(data.comment ?? "Failed to fetch Codeforces contests");
      }

      const upcomingContests = data.result
        .filter((contest: CodeforcesContest) => contest.phase === "BEFORE")
        .filter(hasStartTime);

      return upcomingContests.map((contest): NormalizedContest => {
        const startTime = new Date(contest.startTimeSeconds * 1000);

        const endTime = new Date((contest.startTimeSeconds + contest.durationSeconds) * 1000);

        return {
          platform: ContestPlatform.CODEFORCES,
          contestId: contest.id.toString(),
          title: contest.name,
          slug: null,
          url: `https://codeforces.com/contest/${contest.id}`,
          startTime,
          endTime,
          duration: contest.durationSeconds,
          registrationOpen: null,
          contestType: contest.type,
          status: ContestStatus.UPCOMING,
        };
      });
    } catch (error: unknown) {
      if (error instanceof CodeforcesProviderError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new CodeforcesProviderError(error.message);
      }

      throw new CodeforcesProviderError("Unknown Codeforces provider error");
    }
  }
}
