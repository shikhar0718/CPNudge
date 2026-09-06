import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../auth/auth.types.js";
import { submissionService } from "./submission.service.js";
import APIResponse from "../../../common/utils/api.response.js";
import { ContestPlatform } from "../../../../generated/prisma/enums.js";
import APIError from "../../../common/utils/api.errors.js";

const parsePlatformParam = (param?: string): ContestPlatform | undefined => {
  if (!param) return undefined;
  const upperParam = param.trim().toUpperCase();
  if (Object.values(ContestPlatform).includes(upperParam as ContestPlatform)) {
    return upperParam as ContestPlatform;
  }
  throw APIError.badRequest(`Invalid platform specified: ${param}`);
};

export const getSubmissionActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const platform = parsePlatformParam(req.query.platform as string | undefined);

    const activities = await submissionService.getUserSubmissionActivity(userId, platform);
    return APIResponse.ok(res, "Submission activity fetched successfully.", activities);
  } catch (error) {
    next(error);
  }
};

export const syncUserSubmissionActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const summary = await submissionService.syncUserSubmissionActivity(userId);
    return APIResponse.ok(res, "Submission activity synchronization completed.", summary);
  } catch (error) {
    next(error);
  }
};

export const syncAllSubmissionActivity = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const summary = await submissionService.syncSubmissionActivity();
    return APIResponse.ok(res, "Global submission activity synchronization completed.", summary);
  } catch (error) {
    next(error);
  }
};
