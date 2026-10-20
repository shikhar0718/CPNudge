import type { NextFunction, Request, Response } from "express";
import APIResponse from "../../common/utils/api.response.js";
import type { AuthenticatedRequest } from "../auth/auth.types.js";
import * as service from "./notification-preference.service.js";

const userIdFrom = (request: Request): string => (request as AuthenticatedRequest).user.id;

export const getNotificationPreference = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const preference = await service.getNotificationPreference(userIdFrom(req));
    return APIResponse.ok(res, "Notification preferences fetched successfully.", preference);
  } catch (error) {
    next(error);
  }
};

export const updateNotificationPreference = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const preference = await service.updateNotificationPreference(userIdFrom(req), req.body);
    return APIResponse.ok(res, "Notification preferences updated successfully.", preference);
  } catch (error) {
    next(error);
  }
};
