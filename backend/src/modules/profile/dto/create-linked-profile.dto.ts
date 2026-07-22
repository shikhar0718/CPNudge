import type { ContestPlatform } from "../../../../generated/prisma/enums.js";

export interface CreateLinkedProfileDto {
  platform: ContestPlatform;
  username: string;
}
