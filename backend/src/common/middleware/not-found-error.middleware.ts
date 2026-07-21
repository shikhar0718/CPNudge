import type { Request, Response, NextFunction } from "express";
import APIError from "../utils/api.errors.js";

export function notFoundMiddleware(req: Request, res: Response, next: NextFunction) {
  next(APIError.notFound(`Can't find ${req.originalUrl} on this server!`));
}
