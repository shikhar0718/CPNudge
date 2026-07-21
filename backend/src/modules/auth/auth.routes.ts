import { Router } from "express";
import * as controller from "./auth.controller.js";
import validateDto from "../../common/middleware/dto.validator.js";
import { registerSchema } from "./dto/register.dto.js";
import { loginSchema } from "./dto/login.dto.js";
import { refreshSchema } from "./dto/refresh.dto.js";
import { authMiddleware } from "./auth.middleware.js";

const authRouter = Router();

authRouter.post("/register", validateDto(registerSchema), controller.Register);
authRouter.post("/login", validateDto(loginSchema), controller.Login);
authRouter.get("/verify-email", controller.VerifyEmail);
authRouter.get("/me", authMiddleware, controller.GetMe);

authRouter.post("/refresh", validateDto(refreshSchema), controller.Refresh);
authRouter.post("/logout", validateDto(refreshSchema), controller.Logout);
authRouter.post("/logout-all", authMiddleware, controller.LogoutAll);

export { authRouter };
