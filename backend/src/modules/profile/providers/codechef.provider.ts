import { ContestPlatform } from "../../../../generated/prisma/enums.js";
import type { ProfileProvider } from "./profile-provider.interface.js";

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
}
