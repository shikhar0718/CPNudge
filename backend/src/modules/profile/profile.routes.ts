import { Router } from "express";

import { authMiddleware } from "../auth/auth.middleware.js";

import * as Controller from "./profile.controller.js";
import type { LinkedProfileResponse } from "./dto/linked-profile-response.dto.js";

const profileRouter = Router();
profileRouter.post("/link-profile", authMiddleware, Controller.linkProfile);

export default profileRouter;
