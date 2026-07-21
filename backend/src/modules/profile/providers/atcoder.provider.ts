import { ContestPlatform } from "../../../../generated/prisma/enums.js";
import type { ProfileProvider } from "./profile-provider.interface.js";

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
}
