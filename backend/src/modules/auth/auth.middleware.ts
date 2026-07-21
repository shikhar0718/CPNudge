import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import APIError from "../../common/utils/api.erros.js";
import { verifyAccessToken } from "../../common/utils/jwt.utils.js";
import type { AuthenticatedRequest, AuthPayload } from "./auth.types.js";
import { updateLastActivity } from "../session/index.js";
import { logger } from "../../common/shared/logger.js";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw APIError.unauthorized("Missing Authorization header");
  }

  if (!authHeader.startsWith("Bearer ")) {
    throw APIError.unauthorized("Invalid token");
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw APIError.unauthorized("Invalid token");
  }

  try {
    const payload = verifyAccessToken(token) as AuthPayload;

    (req as AuthenticatedRequest).user = {
      id: payload.id,
      email: payload.email,
      username: payload.username,
      sessionId: payload.sessionId,
    };

    // Fire-and-forget activity update
    void updateLastActivity(payload.sessionId).catch((err) => {
      logger.warn("Failed to update session activity", err);
    });

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw APIError.unauthorized("Expired token");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw APIError.unauthorized("Invalid token");
    }
    throw APIError.unauthorized("Invalid token");
  }
};
