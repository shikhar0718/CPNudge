import { Router } from "express";
import { authMiddleware } from "../../auth/auth.middleware.js";
import * as Controller from "./contest-activity.controller.js";

const contestActivityRouter = Router();

contestActivityRouter.get("/", authMiddleware, Controller.getContestActivity);
contestActivityRouter.get("/latest", authMiddleware, Controller.getLatestContestParticipation);
contestActivityRouter.get(
  "/latest/:platform",
  authMiddleware,
  Controller.getLatestContestParticipation
);
contestActivityRouter.get("/count", authMiddleware, Controller.getContestParticipationCount);
contestActivityRouter.post("/sync", authMiddleware, Controller.syncUserContestActivity);
contestActivityRouter.post("/sync-all", authMiddleware, Controller.syncAllContestActivity);

export default contestActivityRouter;
