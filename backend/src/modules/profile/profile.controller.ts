import type { Request, Response, NextFunction } from "express";
import APIError from "../../common/utils/api.errors.js";
import APIResponse from "../../common/utils/api.response.js";
import * as profileService from "./profile.service.js";
import type { AuthenticatedRequest } from "../auth/auth.types.js";
import type { CreateLinkedProfileDto } from "./dto/create-linked-profile.dto.js";
import { ContestPlatform } from "../../../generated/prisma/enums.js";

const parsePlatformParam = (param: string): ContestPlatform => {
  if (!param) {
    throw APIError.badRequest("Platform param is required.");
  }
  const upperParam = param.trim().toUpperCase();
  if (Object.values(ContestPlatform).includes(upperParam as ContestPlatform)) {
    return upperParam as ContestPlatform;
  }
  throw APIError.badRequest(`Invalid platform specified: ${param}`);
};

export const linkProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    if (!req.body?.platform || !req.body?.username) {
      throw APIError.badRequest("Both platform and username are required.");
    }
    const platform = parsePlatformParam(req.body.platform);
    const data: CreateLinkedProfileDto = {
      platform,
      username: req.body.username,
    };

    const linkedProfile = await profileService.linkProfile(userId, data);
    return APIResponse.created(res, "Profile linked successfully.", linkedProfile);
  } catch (e) {
    next(e);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const platform = parsePlatformParam(req.params.platform as string);

    if (!req.body?.username) {
      throw APIError.badRequest("Username is required for update.");
    }

    const updatedProfile = await profileService.updateProfile(userId, {
      platform,
      username: req.body.username,
    });

    return APIResponse.ok(res, "Profile updated successfully.", updatedProfile);
  } catch (error) {
    next(error);
  }
};

export const unlinkProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const platform = parsePlatformParam(req.params.platform as string);

    await profileService.unlinkProfile(userId, platform);

    return APIResponse.ok(res, "Profile unlinked successfully.");
  } catch (error) {
    next(error);
  }
};

export const getLinkedProfiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;

    const linkedProfiles = await profileService.getLinkedProfiles(userId);

    return APIResponse.ok(res, "Linked platforms fetched successfully.", linkedProfiles);
  } catch (error) {
    next(error);
  }
};
