import { NextFunction, Request, Response } from "express";
import z from "zod";
export const validate =
  (schema: z.ZodTypeAny) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new Error("Validation failed"));
    }
    req.body = result.data;
    next();
  };
