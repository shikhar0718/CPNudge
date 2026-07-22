import type { LinkedProfileResponse } from "./dto/linked-profile-response.dto.js";
import type { CreateLinkedProfileDto } from "./dto/create-linked-profile.dto.js";
import type { UpdateLinkedProfileDto } from "./dto/update-linked-profile.dto.js";
import type { LinkedPlatformsResponseDto } from "./dto/get-linked-profiles-response.dto.js";

import {
  createLinkedProfile,
  findLinkedProfile,
  updateLinkedProfile,
  deleteLinkedProfile,
  getUserLinkedProfiles,
} from "./profile.repository.js";

import { ContestPlatform } from "../../../generated/prisma/enums.js";
import { profileVerificationService } from "./services/profile-verification.service.js";
import APIError from "../../common/utils/api.errors.js";

export const linkProfile = async (
  userId: string,
  data: CreateLinkedProfileDto
): Promise<LinkedProfileResponse> => {
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

export const updateProfile = async (
  userId: string,
  data: UpdateLinkedProfileDto
): Promise<LinkedProfileResponse> => {
  const existingProfile = await findLinkedProfile(userId, data.platform);

  if (!existingProfile) {
    throw APIError.notFound("No linked profile found for this platform.");
  }

  const profileExists = await profileVerificationService.verifyProfile(
    data.platform,
    data.username
  );
  if (!profileExists) {
    throw APIError.badRequest("The provided profile does not exist.");
  }

  const updatedProfile = await updateLinkedProfile(userId, data.platform, data.username);

  return {
    platform: updatedProfile.platform,
    username: updatedProfile.username,
  };
};

export const unlinkProfile = async (userId: string, platform: ContestPlatform): Promise<void> => {
  const existingProfile = await findLinkedProfile(userId, platform);

  if (!existingProfile) {
    throw APIError.notFound("No linked profile found for this platform.");
  }

  await deleteLinkedProfile(userId, platform);
};

export const getLinkedProfiles = async (userId: string): Promise<LinkedPlatformsResponseDto> => {
  const userProfiles = await getUserLinkedProfiles(userId);

  const getUsernameForPlatform = (platform: ContestPlatform): string | null => {
    const found = userProfiles.find((p) => p.platform === platform);
    return found ? found.username : null;
  };

  return {
    codeforces: getUsernameForPlatform(ContestPlatform.CODEFORCES),
    leetcode: getUsernameForPlatform(ContestPlatform.LEETCODE),
    codechef: getUsernameForPlatform(ContestPlatform.CODECHEF),
    atcoder: getUsernameForPlatform(ContestPlatform.ATCODER),
  };
};
