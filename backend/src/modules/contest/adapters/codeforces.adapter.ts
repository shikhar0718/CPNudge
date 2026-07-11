import type { ContestProvider } from "../providers/contest.provider.js";
import type { NormalizedContest } from "../contest.types.js";

export class CodeforcesAdapter implements ContestProvider {
  async fetchUpcomingContests(): Promise<NormalizedContest[]> {
    return [];
  }
}
