import { ContestPlatform } from "../../../../generated/prisma/enums.js";
import type {
  NormalizedContestParticipation,
  ProfileProvider,
} from "./profile-provider.interface.js";
import { logger } from "../../../common/shared/logger.js";

interface AtCoderHistoryEntry {
  IsRated: boolean;
  Place: number;
  OldRating: number;
  NewRating: number;
  Performance: number;
  InnerPerformance: number;
  ContestScreenName: string;
  ContestName: string;
  ContestNameEn?: string;
  EndTime: string;
}

export class AtcoderProfileProvider implements ProfileProvider {
  supports(platform: ContestPlatform): boolean {
    return platform === ContestPlatform.ATCODER;
  }

  async verify(username: string): Promise<boolean> {
    try {
      const response = await fetch(`https://atcoder.jp/users/${username}`, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
        signal: AbortSignal.timeout(5000),
      });

      return response.status === 200;
    } catch {
      return false;
    }
  }

  async fetchContestParticipation(username: string): Promise<NormalizedContestParticipation[]> {
    try {
      const response = await fetch(
        `https://atcoder.jp/users/${encodeURIComponent(username)}/history/json`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          },
          signal: AbortSignal.timeout(5000),
        }
      );

      if (!response.ok) {
        throw new Error(`AtCoder history returned ${response.status}`);
      }

      const data = (await response.json()) as AtCoderHistoryEntry[];
      if (!Array.isArray(data)) {
        return [];
      }

      const participations: NormalizedContestParticipation[] = data.map((entry) => {
        const contestId = entry.ContestScreenName
          ? entry.ContestScreenName.split(".")[0] || entry.ContestScreenName
          : entry.ContestName;

        return {
          platform: ContestPlatform.ATCODER,
          contestId,
          contestName: entry.ContestName || entry.ContestNameEn || contestId,
          participatedAt: new Date(entry.EndTime),
        };
      });

      logger.info(
        `Fetched ${participations.length} contest participations from ATCODER for ${username}`
      );

      return participations;
    } catch (error) {
      logger.error(`Failed to fetch AtCoder contest participation for ${username}`, { error });
      return [];
    }
  }
}
