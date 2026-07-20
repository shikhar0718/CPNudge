import { type Request, type Response, type NextFunction } from "express";

import APIResponse from "../../common/utils/api.response.js";

import { contestService } from "./contest.service.js";
import type { ContestQueryDto } from "./dto/contest-query.dto.js";

export const GetContests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query as unknown as ContestQueryDto;

    const { contests, pagination } = await contestService.getContests(query);

    APIResponse.paginated(res, "Contests fetched successfully.", contests, pagination);
  } catch (e) {
    next(e);
  }
};

export const GetContestById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contestId = req.params.contestId as string;

    const contest = await contestService.getContestById(contestId);

    APIResponse.ok(res, "Contest fetched successfully.", contest);
  } catch (e) {
    next(e);
  }
};

export const SyncContests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = await contestService.syncContests();

    APIResponse.ok(res, "Contest synchronization completed successfully.", summary);
  } catch (e) {
    next(e);
  }
};
