import type { Request, Response, NextFunction } from "express";
import { ZodObject } from "zod";
import APIError from "../utils/api.errors.js";

export const validateQuery = (schema: ZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => issue.message);

      throw APIError.badRequest(errors.join("; "));
    }

    Object.defineProperty(req, "query", {
      value: result.data,
      writable: true,
      configurable: true,
      enumerable: true,
    });

    next();
  };
};

export default validateQuery;
