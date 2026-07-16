import { Router } from "express";

import { GetUpcomingContests, GetContestById, SyncContests } from "./contest.controller.js";

const contestRouter = Router();

contestRouter.get("/", GetUpcomingContests);

contestRouter.get("/:contestId", GetContestById);

contestRouter.post("/sync", SyncContests);

export default contestRouter;
