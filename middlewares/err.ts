import { NextFunction, Response, Request } from "express";

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
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : null,
  });
};
