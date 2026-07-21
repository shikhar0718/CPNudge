import { ContestPlatform } from "../../../../generated/prisma/enums.js";
import type { ProfileProvider } from "../providers/profile-provider.interface.js";
import { CodeforcesProfileProvider } from "../providers/codeforces.provider.js";
import { LeetcodeProfileProvider } from "../providers/leetcoder.provider.js";
import { CodechefProfileProvider } from "../providers/codechef.provider.js";
import { AtcoderProfileProvider } from "../providers/atcoder.provider.js";
import APIError from "../../../common/utils/api.erros.js";

export class ProfileVerificationService {
  private readonly providers: ProfileProvider[];

  constructor() {
    this.providers = [
      new CodeforcesProfileProvider(),
      new LeetcodeProfileProvider(),
      new CodechefProfileProvider(),
      new AtcoderProfileProvider(),
    ];
  }

  async verifyProfile(platform: ContestPlatform, username: string): Promise<boolean> {
    const provider = this.providers.find((p) => p.supports(platform));

    if (!provider) {
      throw APIError.badRequest(`Unsupported platform: ${platform}`);
    }

    return provider.verify(username);
  }
}

export const profileVerificationService = new ProfileVerificationService();
