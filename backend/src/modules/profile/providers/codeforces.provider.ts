import { ContestPlatform } from "../../../../generated/prisma/enums.js";
import type { ProfileProvider } from "./profile-provider.interface.js";

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
}
