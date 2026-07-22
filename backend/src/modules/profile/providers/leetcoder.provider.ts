import { ContestPlatform } from "../../../../generated/prisma/enums.js";
import type { ProfileProvider } from "./profile-provider.interface.js";

const QUERY = `
query VerifyUser($username: String!) {   
  matchedUser(username: $username) {
    username
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
          query: QUERY,
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
}
