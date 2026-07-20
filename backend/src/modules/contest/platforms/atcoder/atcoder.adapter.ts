import type { NormalizedContest } from "../../contest.types.js";
import type { ContestProvider } from "../../providers/contest.provider.js";
import { normalizeAtCoderContest } from "./atcoder.normalizer.js";
import { extractUpcomingContestRecords } from "./atcoder.parser.js";

const ATCODER_CONTESTS_URL = "https://atcoder.jp/contests";

export class AtCoderAdapter implements ContestProvider {
  async fetchUpcomingContests(): Promise<NormalizedContest[]> {
    const html = await this.fetchContestPage();

    const contestRecords = extractUpcomingContestRecords(html);

    const contests: NormalizedContest[] = [];

    for (const contestRecord of contestRecords) {
      try {
        contests.push(normalizeAtCoderContest(contestRecord));
      } catch (error) {
        console.error(
          `[AtCoderAdapter] Skipping malformed contest ${contestRecord.contestId}:`,
          error
        );
      }
    }

    return contests;
  }
  private async fetchContestPage(): Promise<string> {
    try {
      const response = await fetch(ATCODER_CONTESTS_URL);

      if (!response.ok) {
        throw new Error(`AtCoder page request failed with status ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      throw new Error("AtCoder provider unavailable", { cause: error });
    }
  }
}
