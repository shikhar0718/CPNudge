import type { NextFunction, Request, Response } from "express";
import APIResponse from "../../common/utils/api.response.js";
import type { AuthenticatedRequest } from "../auth/auth.types.js";
import type { NotificationHistoryQuery } from "./notification.types.js";
import * as service from "./notification-history.service.js";

const userIdFrom = (request: Request): string => (request as AuthenticatedRequest).user.id;

export const getNotificationHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query as unknown as NotificationHistoryQuery;

    const result = await service.getNotificationHistory(userIdFrom(req), query);

    return APIResponse.paginated(
      res,
      "Notification history retrieved successfully.",
      result.notifications,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};
