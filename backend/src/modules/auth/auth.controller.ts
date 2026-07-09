import { type Request, type Response, type NextFunction } from "express";

import APIResponse from "../../common/utils/api.response.js";
import { authService } from "./index.js";

export const Register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.register(req.body);
    APIResponse.created(res, "Registration Successful", user);
  } catch (e) {
    next(e);
  }
};
