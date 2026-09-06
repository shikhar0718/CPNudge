import { ContestPlatform } from "../../../../generated/prisma/enums.js";
import type { ProfileProvider } from "./profile-provider.interface.js";
import { CodeforcesProfileProvider } from "./codeforces.provider.js";
import { CodechefProfileProvider } from "./codechef.provider.js";
import { LeetcodeProfileProvider } from "./leetcoder.provider.js";
import { AtcoderProfileProvider } from "./atcoder.provider.js";

export class ProfileProviderRegistry {
  private readonly providers: ProfileProvider[];

  constructor(providers?: ProfileProvider[]) {
    this.providers = providers ?? [
      new CodeforcesProfileProvider(),
      new CodechefProfileProvider(),
      new LeetcodeProfileProvider(),
      new AtcoderProfileProvider(),
    ];
  }

  get(platform: ContestPlatform): ProfileProvider | undefined {
    return this.providers.find((p) => p.supports(platform));
  }

  getAll(): ProfileProvider[] {
    return [...this.providers];
  }

  supports(platform: ContestPlatform): boolean {
    return this.providers.some((p) => p.supports(platform));
  }
}

export const profileProviderRegistry = new ProfileProviderRegistry();
