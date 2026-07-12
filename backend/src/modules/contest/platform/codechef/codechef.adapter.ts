import type { ContestProvider } from "../../providers/contest.provider.js";
import type { NormalizedContest } from "../../contest.types.js";

import { ContestPlatform, ContestStatus } from "../../../../../generated/prisma/client.js";

import type { CodeChefContest, CodeChefResponse } from "./codechef.types.js";
import { error } from "node:console";

const CODECHEF_API_URL =
  "https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset=0&mode=all";

export class CodeChefAdapter implements ContestProvider {
  async fetchUpcomingContests(): Promise<NormalizedContest[]> {
    const response = await fetch(CODECHEF_API_URL);

    if (!response.ok) {
      throw new Error(`CodeChef API request failed with status ${response.status}`);
    }

    const data = (await response.json()) as CodeChefResponse;

    if (data.status !== "success" || !Array.isArray(data.future_contests)) {
      throw new Error("Invalid CodeChef API response");
    }

    const contests: NormalizedContest[] = [];

    for (const contest of data.future_contests) {
      try {
        if (
          !contest.contest_code ||
          !contest.contest_name ||
          !contest.contest_start_date_iso ||
          !contest.contest_end_date_iso
        ) {
          throw new Error("Missing required contest fields");
        }

        const startTime = new Date(contest.contest_start_date_iso);
        const endTime = new Date(contest.contest_end_date_iso);

        if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
          throw new Error("Invalid contest date");
        }

        const durationSeconds = (endTime.getTime() - startTime.getTime()) / 1000;

        if (durationSeconds <= 0) {
          throw new Error("Invalid contest duration");
        }

        const contestTypeMatch = contest.contest_code.match(/^[A-Za-z]+/);

        contests.push({
          platform: ContestPlatform.CODECHEF,
          contestId: contest.contest_code,
          title: contest.contest_name,
          slug: null,
          url: `https://www.codechef.com/${contest.contest_code}`,
          startTime,
          endTime,
          duration: durationSeconds,
          registrationOpen: null,
          contestType: contestTypeMatch?.[0] ?? null,
          status: ContestStatus.UPCOMING,
        });
      } catch (error) {
        console.error(
          `[CodeChefAdapter] Skipping malformed contest ${contest.contest_code ?? "UNKNOWN"}:`,
          error
        );
      }
    }

    return contests;
  }
}
