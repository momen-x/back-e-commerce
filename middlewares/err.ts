import { NextFunction, Response, Request } from "express";
import { AppError } from "../utils/AppError.js";

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Not Found - ${req.originalUrl}`);

  res.status(404).json({
    message: err.message,
  });
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(
      err.shape === "string" ? err.message : { [err.shape]: err.message },
    );
    return;
  }
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : null,
  });
};
