import { type Request, type Response, type NextFunction } from "express";

import APIResponse from "../../common/utils/api.response.js";
import APIError from "../../common/utils/api.erros.js";

import { contestService } from "./contest.service.js";

export const GetUpcomingContests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contests = await contestService.getUpcomingContests();

    APIResponse.ok(res, "Upcoming contests fetched successfully.", contests);
  } catch (e) {
    next(e);
  }
};

export const GetContestById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contestId = req.params.conntestID as string;

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
