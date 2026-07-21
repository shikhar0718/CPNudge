import type { Request, Response, NextFunction } from "express";
import { APIError } from "../utils/api.errors.js";

export function errorHandlerMiddleware(
  err: Error & { statusCode?: number; status?: string; isOperational?: boolean },
  req: Request,
  res: Response,
  _next: NextFunction
) {
  let statusCode = err.statusCode || 500;
  let status = err.status || "error";
  let message = err.message || "Internal Server Error";

  if (err instanceof APIError) {
    statusCode = err.statusCode;
    status = err.status;
    message = err.message;
  }

  // In production, do not leak non-operational details
  if (process.env.NODE_ENV === "production" && !err.isOperational) {
    statusCode = 500;
    status = "error";
    message = "Something went wrong!";
  }

  res.status(statusCode).json({
    status,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

export default errorHandlerMiddleware;
