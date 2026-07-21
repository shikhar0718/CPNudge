import type { Request, Response, NextFunction } from "express";
import { ZodObject } from "zod";
import APIError from "../utils/api.errors.js";

const validateDto = (schema: ZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => issue.message);

      throw APIError.badRequest(errors.join("; "));
    }

    req.body = result.data;

    next();
  };
};

export default validateDto;
