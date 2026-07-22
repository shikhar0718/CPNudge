import type { LinkedProfileResponse } from "./dto/linked-profile-response.dto.js";
import type { CreateLinkedProfileDto } from "./dto/create-linked-profile.dto.js";

import { createLinkedProfile, findLinkedProfile } from "./profile.repository.js";

import { ContestPlatform } from "../../../generated/prisma/enums.js";

import { profileVerificationService } from "./services/profile-verification.service.js";

import APIError from "../../common/utils/api.errors.js";

export const linkProfile = async (
  userId: string,
  data: CreateLinkedProfileDto
): Promise<LinkedProfileResponse> => {
  //  check that if a the user already has linked other handle for the same platform
  const existingProfile = await findLinkedProfile(userId, data.platform);

  if (existingProfile) {
    throw APIError.conflict("You have already linked a profile for this platform.");
  }

  const profileExists = await profileVerificationService.verifyProfile(
    data.platform,
    data.username
  );
  if (!profileExists) {
    throw APIError.badRequest("The provided profile does not exist.");
  }
  const linkedProfile = await createLinkedProfile(userId, data);

  return {
    platform: linkedProfile.platform,
    username: linkedProfile.username,
  };
};
