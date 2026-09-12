import { ContestPlatform } from "../../../../generated/prisma/enums.js";
import type {
  NormalizedActivity,
  NormalizedContestParticipation,
  ProfileProvider,
} from "./profile-provider.interface.js";
import { logger } from "../../../common/shared/logger.js";

interface CodeforcesRatingChange {
  contestId: number;
  contestName: string;
  handle: string;
  rank: number;
  ratingUpdateTimeSeconds: number;
  oldRating: number;
  newRating: number;
}

interface CodeforcesRatingResponse {
  status: string;
  result?: CodeforcesRatingChange[];
  comment?: string;
}

export class CodeforcesProfileProvider implements ProfileProvider {
  supports(platform: ContestPlatform): boolean {
    return platform === ContestPlatform.CODEFORCES;
  }

  async verify(username: string): Promise<boolean> {
    try {
      const response = await fetch(`https://codeforces.com/api/user.info?handles=${username}`, {
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        return false;
      }

      const data = (await response.json()) as { status: string };
      return data.status === "OK";
    } catch {
      return false;
    }
  }

  async fetchActivity(username: string): Promise<NormalizedActivity[]> {
    try {
      const response = await fetch(
        `https://codeforces.com/api/user.status?handle=${username}&from=1&count=100`,
        {
          signal: AbortSignal.timeout(5000),
        }
      );
      if (!response.ok) {
        throw new Error(`Codeforces API returned ${response.status}`);
      }

      const data = await response.json();
      if (data.status !== "OK") {
        return [];
      }

      const activityMap = new Map<string, number>();

      for (const submission of data.result) {
        const date = new Date(submission.creationTimeSeconds * 1000);
        const day = date.toISOString().split("T")[0];
        if (!day) continue;

        activityMap.set(day, (activityMap.get(day) ?? 0) + 1);
      }

      return Array.from(activityMap.entries()).map(([day, submissionCount]) => ({
        platform: ContestPlatform.CODEFORCES,
        username,
        activityDate: new Date(day),
        submissionCount,
      }));
    } catch (error) {
      logger.error(`Failed to fetch Codeforces activity for ${username}`, { error });
      return [];
    }
  }

  async fetchContestParticipation(username: string): Promise<NormalizedContestParticipation[]> {
    try {
      const response = await fetch(
        `https://codeforces.com/api/user.rating?handle=${encodeURIComponent(username)}`,
        {
          signal: AbortSignal.timeout(5000),
        }
      );

      if (!response.ok) {
        throw new Error(`Codeforces API returned ${response.status}`);
      }

      const data = (await response.json()) as CodeforcesRatingResponse;
      if (data.status !== "OK" || !Array.isArray(data.result)) {
        return [];
      }

      const participations: NormalizedContestParticipation[] = data.result.map((contest) => ({
        platform: ContestPlatform.CODEFORCES,
        contestId: String(contest.contestId),
        contestName: contest.contestName,
        participatedAt: new Date(contest.ratingUpdateTimeSeconds * 1000),
      }));

      logger.info(
        `Fetched ${participations.length} contest participations from CODEFORCES for ${username}`
      );

      return participations;
    } catch (error) {
      logger.error(`Failed to fetch Codeforces contest participation for ${username}`, { error });
      return [];
    }
  }
}
