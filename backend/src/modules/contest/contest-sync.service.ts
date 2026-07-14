import type { ContestProvider } from "./providers/contest.provider.js";
import { LeetcodeAdapter } from "./platform/leetcode/leetcode.adapter.js";
import { AtCoderAdapter } from "./platform/atcoder/atcoder.adapter.js";
import { CodeChefAdapter } from "./platform/codechef/codechef.adapter.js";
import { CodeforcesAdapter } from "./platform/codeforces/codeforces.adapter.js";
import type { NormalizedContest } from "./contest.types.js";
import { upsertManyContests } from "./contest.repository.js";

const providers: ContestProvider[] = [
  new AtCoderAdapter(),
  new CodeChefAdapter(),
  new CodeforcesAdapter(),
  new LeetcodeAdapter(),
];

export async function syncContests() {
  const providerPromises = providers.map((provider) => {
    return provider.fetchUpcomingContests();
  });

  const providerResults = await Promise.allSettled(providerPromises);

  const contests: NormalizedContest[] = [];

  for (const result of providerResults) {
    if (result.status === "fulfilled") {
      contests.push(...result.value);
    } else {
      console.error("Contest provider has failed:", result.reason);
    }
  }

  await upsertManyContests(contests);
}
