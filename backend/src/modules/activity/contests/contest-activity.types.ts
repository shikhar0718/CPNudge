import type {
  ContestPlatform,
  ContestParticipationActivity,
} from "../../../../generated/prisma/client.js";

export type ContestParticipation = ContestParticipationActivity;

export interface UpsertContestActivityParams {
  platform: ContestPlatform;
  contestId: string;
  contestName: string;
  participatedAt: Date;
}
