import { Router } from "express";

import { GetContests, GetContestById, SyncContests } from "./contest.controller.js";
import { validateQuery } from "../../common/middleware/index.js";
import { contestQuerySchema } from "./dto/contest-query.dto.js";

const contestRouter = Router();

contestRouter.get("/", validateQuery(contestQuerySchema), GetContests);

contestRouter.get("/:contestId", GetContestById);

contestRouter.post("/sync", SyncContests);

export default contestRouter;
