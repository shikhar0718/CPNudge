import { ContestPlatform } from "../../../../generated/prisma/enums.js";
import type { NormalizedActivity, ProfileProvider } from "./profile-provider.interface.js";
import { logger } from "../../../common/shared/logger.js";

const VERIFY_USER_QUERY = `
query VerifyUser($username: String!) {   
  matchedUser(username: $username) {
    username
  }
}`;

const SUBMISSION_ACTIVITY_QUERY = `
query UserProfileCalendar($username: String!) {
  matchedUser(username: $username) {
    submissionCalendar
  }
}`;

interface GraphQLError {
  message: string;
}

interface LeetCodeResponse {
  data: {
    matchedUser: {
      username: string;
    } | null;
  };
  errors?: GraphQLError[];
}

interface LeetCodeActivityResponse {
  data: {
    matchedUser: {
      submissionCalendar: string;
    } | null;
  };
  errors?: GraphQLError[];
}

export class LeetcodeProfileProvider implements ProfileProvider {
  supports(platform: ContestPlatform): boolean {
    return platform === ContestPlatform.LEETCODE;
  }
  async verify(username: string): Promise<boolean> {
    try {
      const response = await fetch("https://leetcode.com/graphql/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
        body: JSON.stringify({
          operationName: "getUserProfile",
          query: VERIFY_USER_QUERY,
          variables: {
            username,
          },
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        return false;
      }

      const result = (await response.json()) as LeetCodeResponse;

      return result.data.matchedUser !== null;
    } catch {
      return false;
    }
  }

  async fetchActivity(username: string): Promise<NormalizedActivity[]> {
    try {
      const response = await fetch("https://leetcode.com/graphql/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
        body: JSON.stringify({
          operationName: "UserProfileCalendar",
          query: SUBMISSION_ACTIVITY_QUERY,
          variables: {
            username,
          },
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`LeetCode API returned ${response.status}`);
      }

      const result = (await response.json()) as LeetCodeActivityResponse;

      if (!result.data.matchedUser) {
        return [];
      }

      const calendar = JSON.parse(result.data.matchedUser.submissionCalendar) as Record<
        string,
        number
      >;

      return Object.entries(calendar).map(([timestamp, submissionCount]) => ({
        platform: ContestPlatform.LEETCODE,
        username,
        activityDate: new Date(Number(timestamp) * 1000),
        submissionCount,
      }));
    } catch (error) {
      logger.error(`Failed to fetch LeetCode activity for ${username}`, { error });

      return [];
    }
  }
}
