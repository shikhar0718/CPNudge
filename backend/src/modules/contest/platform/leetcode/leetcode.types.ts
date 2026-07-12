export interface LeetcodeContest {
  titleSlug: string;
  title: string;
  startTime: number;
  duration: number;
}

export interface LeetcodeErrorLocation {
  line: number;
  column: number;
}

export interface LeetcodeError {
  message: string;
  locations?: LeetcodeErrorLocation[];
}

export interface LeetcodeResponse {
  data?: {
    contestV2UpcomingContests?: LeetcodeContest[];
  };
  errors?: LeetcodeError[];
}

export const isValidContest = (contest: unknown): contest is LeetcodeContest => {
  if (typeof contest !== "object" || contest === null) {
    return false;
  }

  const value = contest as Record<string, unknown>;

  return (
    typeof value.titleSlug === "string" &&
    value.titleSlug.length > 0 &&
    typeof value.title === "string" &&
    value.title.length > 0 &&
    typeof value.startTime === "number" &&
    Number.isFinite(value.startTime) &&
    typeof value.duration === "number" &&
    Number.isFinite(value.duration) &&
    value.duration > 0
  );
};
