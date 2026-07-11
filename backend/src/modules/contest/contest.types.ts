import type { ContestPlatform, ContestStatus } from "../../../generated/prisma/client.js";

export interface NormalizedContest {
  platform: ContestPlatform;
  contestId: string;
  title: string;
  slug: string | null;
  url: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  registrationOpen: boolean | null;
  contestType: string | null;
  status: ContestStatus;
}
