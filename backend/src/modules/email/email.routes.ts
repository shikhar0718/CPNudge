import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware.js";
import { sendTestEmail } from "./email.controller.js";

const emailRouter = Router();
if (process.env.NODE_ENV === "development") {
  emailRouter.post("/test", authMiddleware, sendTestEmail);
}

export default emailRouter;
