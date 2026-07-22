import type { ContestPlatform } from "../../../../generated/prisma/enums.js";

export interface UpdateLinkedProfileDto {
  platform: ContestPlatform;
  username: string;
}
