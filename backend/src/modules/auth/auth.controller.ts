import { type Request, type Response, type NextFunction } from "express";

import APIResponse from "../../common/utils/api.response.js";
import APIError from "../../common/utils/api.errors.js";
import { authService } from "./index.js";
import { emailService } from "../email/index.js";
import type { AuthenticatedRequest } from "./auth.types.js";

export const Register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, rawVerificationToken } = await authService.register(req.body);

    const verificationUrl =
      `${req.protocol}://${req.get("host")}` +
      `/api/v1/auth/verify-email?token=${rawVerificationToken}`;

    try {
      await emailService.sendVerificationEmail({
        to: user.email,
        firstName: user.firstName,
        verificationUrl,
      });
    } catch {
      await authService.deleteUserById(user.id);

      throw APIError.badRequest(
        "Registration failed: unable to send verification email. Please try again."
      );
    }

    APIResponse.created(
      res,
      "Registration Successful. Please check your email to verify your account.",
      {
        id: user.id,
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified,
      }
    );
  } catch (e) {
    next(e);
  }
};
export const Login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestMetadata = {
      userAgent: req.get("user-agent") ?? "Unknown",
      ipAddress: req.ip ?? "Unknown",
    };

    const result = await authService.login(req.body, requestMetadata);
    APIResponse.ok(res, "Login successful.", result);
  } catch (e) {
    next(e);
  }
};

export const VerifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.query.token as string | undefined;

    if (!token) {
      throw APIError.badRequest("Verification token is required.");
    }

    await authService.verifyEmailToken(token);
    APIResponse.ok(res, "Email verified successfully. You can now log in.");
  } catch (e) {
    next(e);
  }
};

export const GetMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id, username, email } = authReq.user;
    APIResponse.ok(res, "User profile retrieved successfully.", {
      id,
      username,
      email,
    });
  } catch (e) {
    next(e);
  }
};

export const Refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken);
    APIResponse.ok(res, "Token refreshed successfully.", result);
  } catch (e) {
    next(e);
  }
};

export const Logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    APIResponse.ok(res, "Logged out successfully.");
  } catch (e) {
    next(e);
  }
};

export const LogoutAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    await authService.logoutAll(authReq.user.id);
    APIResponse.ok(res, "Logged out from all devices successfully.");
  } catch (e) {
    next(e);
  }
};
