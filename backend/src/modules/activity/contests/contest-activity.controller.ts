import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../auth/auth.types.js";
import { contestActivityService } from "./contest-activity.service.js";
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

export const getContestActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const platform = parsePlatformParam(req.query.platform as string | undefined);

    const activities = await contestActivityService.getUserContestActivity(userId, platform);
    return APIResponse.ok(res, "Contest activity fetched successfully.", activities);
  } catch (error) {
    next(error);
  }
};

export const getLatestContestParticipation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const platformQuery = (req.query.platform || req.params.platform) as string | undefined;

    if (!platformQuery) {
      throw APIError.badRequest("Platform parameter is required to fetch latest participation.");
    }

    const platform = parsePlatformParam(platformQuery);
    if (!platform) {
      throw APIError.badRequest("Platform parameter is required.");
    }

    const participation = await contestActivityService.getLatestParticipation(userId, platform);
    return APIResponse.ok(res, "Latest contest participation fetched successfully.", participation);
  } catch (error) {
    next(error);
  }
};

export const getContestParticipationCount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const platform = parsePlatformParam(req.query.platform as string | undefined);

    const count = await contestActivityService.getParticipationCount(userId, platform);
    return APIResponse.ok(res, "Contest participation count fetched successfully.", { count });
  } catch (error) {
    next(error);
  }
};

export const syncUserContestActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const summary = await contestActivityService.syncUserContestActivity(userId);
    return APIResponse.ok(res, "Contest activity synchronization completed.", summary);
  } catch (error) {
    next(error);
  }
};

export const syncAllContestActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = await contestActivityService.syncAllContestActivity();
    return APIResponse.ok(res, "Global contest activity synchronization completed.", summary);
  } catch (error) {
    next(error);
  }
};
