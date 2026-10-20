import type { Request, Response, NextFunction } from "express";
import APIResponse from "../../common/utils/api.response.js";
import type { AuthenticatedRequest } from "../auth/auth.types.js";
import { sendContestReminderEmail } from "./email.service.js";

export const sendTestEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const startTime = new Date(Date.now() + 60 * 60 * 1000);
    await sendContestReminderEmail(user.email, {
      title: "CPNudge sample contest",
      platform: "CPNudge",
      url: "https://cpnudge.com/contests/sample",
      startTime,
      endTime: new Date(startTime.getTime() + 2 * 60 * 60 * 1000),
    });
    APIResponse.ok(res, "Test reminder email sent.");
  } catch (error) {
    next(error);
  }
};
