import { Router } from "express";
import { submissionRouter } from "./submission/index.js";
import { contestActivityRouter } from "./contests/index.js";

const activityRouter = Router();

activityRouter.use("/submissions", submissionRouter);
activityRouter.use("/contests", contestActivityRouter);

export { activityRouter, submissionRouter, contestActivityRouter };
export default activityRouter;
