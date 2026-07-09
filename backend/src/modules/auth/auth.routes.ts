import { Router } from "express";
import * as controller from "./auth.controller.js";
import validateDto from "../../common/middleware/dto.validator.js";
import { registerSchema } from "./dto/register.dto.js";

const authRouter = Router();

authRouter.post("/register", validateDto(registerSchema), controller.Register);

export { authRouter };
