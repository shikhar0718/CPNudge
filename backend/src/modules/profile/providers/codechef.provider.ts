import { ContestPlatform } from "../../../../generated/prisma/enums.js";
import type {
  NormalizedActivity,
  NormalizedContestParticipation,
  ProfileProvider,
} from "./profile-provider.interface.js";
import { logger } from "../../../common/shared/logger.js";

interface CodeChefRatingEntry {
  code: string;
  name: string;
  end_date?: string;
  getyear?: string;
  getmonth?: string;
  getday?: string;
  rating?: string;
  rank?: string;
}

export class CodechefProfileProvider implements ProfileProvider {
  supports(platform: ContestPlatform): boolean {
    return platform === ContestPlatform.CODECHEF;
  }

  async verify(username: string): Promise<boolean> {
    try {
      const response = await fetch(`https://www.codechef.com/users/${username}`, {
        redirect: "manual",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
        signal: AbortSignal.timeout(5000),
      });

      return response.status === 200 || response.status === 301;
    } catch {
      return false;
    }
  }

  async fetchActivity(username: string): Promise<NormalizedActivity[]> {
    try {
      const response = await fetch(`https://www.codechef.com/users/${username}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`CodeChef returned ${response.status}`);
      }

      const html = await response.text();

      const match = html.match(/var\s+userDailySubmissionsStats\s*=\s*(\[[^;]*\]);/);

      if (!match || !match[1]) {
        return [];
      }

      const stats = JSON.parse(match[1]) as {
        date: string;
        value: number;
      }[];

      return stats.map((item) => ({
        platform: ContestPlatform.CODECHEF,
        username,
        activityDate: new Date(item.date),
        submissionCount: Number(item.value),
      }));
    } catch (error) {
      logger.error(`Failed to fetch CodeChef activity for ${username}`, { error });
      return [];
    }
  }

  async fetchContestParticipation(username: string): Promise<NormalizedContestParticipation[]> {
    try {
      const response = await fetch(
        `https://www.codechef.com/users/${encodeURIComponent(username)}`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          },
          signal: AbortSignal.timeout(5000),
        }
      );

      if (!response.ok) {
        throw new Error(`CodeChef returned ${response.status}`);
      }

      const html = await response.text();

      const match = html.match(/var\s+all_rating\s*=\s*(\[[^;]*\]);/);

      if (!match || !match[1]) {
        return [];
      }

      const ratings = JSON.parse(match[1]) as CodeChefRatingEntry[];
      if (!Array.isArray(ratings)) {
        return [];
      }

      const participations: NormalizedContestParticipation[] = ratings.map((entry) => {
        let participatedAt: Date;
        if (entry.end_date) {
          participatedAt = new Date(entry.end_date);
        } else if (entry.getyear && entry.getmonth && entry.getday) {
          participatedAt = new Date(
            `${entry.getyear}-${entry.getmonth.padStart(2, "0")}-${entry.getday.padStart(2, "0")}`
          );
        } else {
          participatedAt = new Date();
        }

        return {
          platform: ContestPlatform.CODECHEF,
          contestId: entry.code,
          contestName: entry.name,
          participatedAt,
        };
      });

      logger.info(
        `Fetched ${participations.length} contest participations from CODECHEF for ${username}`
      );

      return participations;
    } catch (error) {
      logger.error(`Failed to fetch CodeChef contest participation for ${username}`, { error });
      return [];
    }
  }
}
