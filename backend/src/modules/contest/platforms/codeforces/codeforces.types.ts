export type CodeforcesContestType = "CF" | "IOI" | "ICPC";

export type CodeforcesContestPhase =
  "BEFORE" | "CODING" | "PENDING_SYSTEM_TEST" | "SYSTEM_TEST" | "FINISHED";

export interface CodeforcesContest {
  id: number;
  name: string;
  type: CodeforcesContestType;
  phase: CodeforcesContestPhase;
  durationSeconds: number;
  startTimeSeconds?: number;
}

export interface CodeforcesContestListResponse {
  status: "OK" | "FAILED";
  comment?: string;
  result?: CodeforcesContest[];
}

export const isCodeforcesContestListResponse = (
  data: unknown
): data is CodeforcesContestListResponse => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  if (!("status" in data)) {
    return false;
  }

  return data.status === "OK" || data.status === "FAILED";
};

export const hasStartTime = (
  contest: CodeforcesContest
): contest is CodeforcesContest & { startTimeSeconds: number } => {
  return contest.startTimeSeconds !== undefined;
};
