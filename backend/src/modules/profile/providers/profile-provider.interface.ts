import { ContestPlatform } from "../../../../generated/prisma/enums.js";

export interface NormalizedActivity {
  platform: ContestPlatform;
  username: string;
  activityDate: Date;
  submissionCount: number;
}

export interface ProfileProvider {
  supports(platform: ContestPlatform): boolean;
  verify(username: string): Promise<boolean>;

  fetchActivity?(username: string): Promise<NormalizedActivity[]>;
}
