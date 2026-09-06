import { Router } from "express";
import { authMiddleware } from "../../auth/auth.middleware.js";
import * as Controller from "./submission.controller.js";

const submissionRouter = Router();

submissionRouter.get("/", authMiddleware, Controller.getSubmissionActivity);
submissionRouter.post("/sync", authMiddleware, Controller.syncUserSubmissionActivity);
submissionRouter.post("/sync/global", Controller.syncAllSubmissionActivity);

export default submissionRouter;
