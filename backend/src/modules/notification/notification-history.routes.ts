import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware.js";
import { validateQuery } from "../../common/middleware/query.validator.js";
import * as controller from "./notification-history.controller.js";
import { notificationHistoryQuerySchema } from "./notification-history.validator.js";

export const notificationHistoryRouter = Router();

notificationHistoryRouter.get(
  "/history",
  authMiddleware,
  validateQuery(notificationHistoryQuerySchema),
  controller.getNotificationHistory
);

export default notificationHistoryRouter;
