import type { Request, Response, NextFunction } from "express";

import APIError from "../../common/utils/api.errors.js";
import APIResponse from "../../common/utils/api.response.js";
import * as profileService from "./profile.service.js";
import type { AuthenticatedRequest } from "../auth/auth.types.js";
import type { CreateLinkedProfileDto } from "./dto/create-linked-profile.dto.js";

export const linkProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const data: CreateLinkedProfileDto = {
      platform: req.body.platform,
      username: req.body.username,
    };

    const LinkedProfile = await profileService.linkProfile(userId, data);
    return APIResponse.created(res, "Profile linked successfully.", LinkedProfile);
  } catch (e) {
    next(e);
  }
};
