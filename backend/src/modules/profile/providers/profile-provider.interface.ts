import { ContestPlatform } from "../../../../generated/prisma/enums.js";

export interface ProfileProvider {
  supports(platform: ContestPlatform): boolean;
  verify(username: string): Promise<boolean>;
}
