import { ContestPlatform } from "../../../../generated/prisma/enums.js";
import type { NormalizedActivity, ProfileProvider } from "./profile-provider.interface.js";
import { logger } from "../../../common/shared/logger.js";

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
}
