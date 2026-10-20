import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware.js";
import validateDto from "../../common/middleware/dto.validator.js";
import * as controller from "./notification-preference.controller.js";
import { updateNotificationPreferenceSchema } from "./notification-preference.dto.js";

export const notificationPreferenceRouter = Router();

notificationPreferenceRouter.get("/", authMiddleware, controller.getNotificationPreference);
notificationPreferenceRouter.put(
  "/",
  authMiddleware,
  validateDto(updateNotificationPreferenceSchema),
  controller.updateNotificationPreference
);

export default notificationPreferenceRouter;
