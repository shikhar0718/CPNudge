import type { ContestPlatform } from "../../../../generated/prisma/enums.js";
export interface LinkedProfileResponse {
  platform: ContestPlatform;
  username: string;
}
