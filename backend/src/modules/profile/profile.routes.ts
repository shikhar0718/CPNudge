import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware.js";
import * as Controller from "./profile.controller.js";

const profileRouter = Router();

profileRouter.post("/link-profile", authMiddleware, Controller.linkProfile);
profileRouter.get("/", authMiddleware, Controller.getLinkedProfiles);
profileRouter.patch("/:platform", authMiddleware, Controller.updateProfile);
profileRouter.delete("/:platform", authMiddleware, Controller.unlinkProfile);

export default profileRouter;
