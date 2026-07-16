import type { ContestProvider } from "./providers/contest.provider.js";
import { LeetcodeAdapter } from "./platform/leetcode/leetcode.adapter.js";
import { AtCoderAdapter } from "./platform/atcoder/atcoder.adapter.js";
import { CodeChefAdapter } from "./platform/codechef/codechef.adapter.js";
import { CodeforcesAdapter } from "./platform/codeforces/codeforces.adapter.js";
import type { NormalizedContest } from "./contest.types.js";
import { upsertManyContests } from "./contest.repository.js";
import type { ContestSyncSummary, ProviderSyncResult } from "./contest-sync.types.js";
import { ContestPlatform } from "../../../generated/prisma/enums.js";
import { logger } from "../../common/shared/logger.js";

const providers: {
  platform: ContestPlatform;
  provider: ContestProvider;
}[] = [
  {
    platform: ContestPlatform.ATCODER,
    provider: new AtCoderAdapter(),
  },
  {
    platform: ContestPlatform.CODECHEF,
    provider: new CodeChefAdapter(),
  },
  {
    platform: ContestPlatform.CODEFORCES,
    provider: new CodeforcesAdapter(),
  },
  {
    platform: ContestPlatform.LEETCODE,
    provider: new LeetcodeAdapter(),
  },
];

export class ContestSyncService {
  async syncContests(): Promise<ContestSyncSummary> {
    const startedAt = new Date();
    const providerPromises = providers.map(({ provider }) => provider.fetchUpcomingContests());

    const providerResults = await Promise.allSettled(providerPromises);

    const contests: NormalizedContest[] = [];

    const providerSyncResults: ProviderSyncResult[] = []; // an empty array for storing the synced result that will be provided by the providers

    providerResults.forEach((result, index) => {
      const platform = providers[index]!.platform;
      if (result.status === "fulfilled") {
        contests.push(...result.value);

        providerSyncResults.push({
          platform,
          success: true,
          noOfContestFetched: result.value.length,
        });
      } else {
        logger.error(`Provider ${platform} failed:`, result.reason);

        providerSyncResults.push({
          platform,
          success: false,
          noOfContestFetched: 0,
          error: "Provider request failed",
        });
      }
    });

    const successfulProviders = providerSyncResults.filter((result) => result.success);
    if (successfulProviders.length === 0) {
      throw new Error("All the providers have been failed , we have failed to sync any contest");
    }

    await upsertManyContests(contests);
    const completedAt = new Date();
    const durationMs = completedAt.getTime() - startedAt.getTime();

    return {
      startedAt,
      completedAt,
      durationMs,
      totalContestFetched: contests.length,
      providerResults: providerSyncResults,
    };
  }
}
