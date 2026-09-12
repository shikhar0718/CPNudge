import { ContestPlatform } from "../../../../generated/prisma/enums.js";

export interface NormalizedActivity {
  platform: ContestPlatform;
  username: string;
  activityDate: Date;
  submissionCount: number;
}

export interface NormalizedContestParticipation {
  platform: ContestPlatform;
  contestId: string;
  contestName: string;
  participatedAt: Date;
}

export interface ProfileProvider {
  supports(platform: ContestPlatform): boolean;
  verify(username: string): Promise<boolean>;

  fetchActivity?(username: string): Promise<NormalizedActivity[]>;
  fetchContestParticipation?(username: string): Promise<NormalizedContestParticipation[]>;
}
