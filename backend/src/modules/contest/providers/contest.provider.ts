import type { NormalizedContest } from "../contest.types.js";

export interface ContestProvider {
  fetchUpcomingContests(): Promise<NormalizedContest[]>;
}
