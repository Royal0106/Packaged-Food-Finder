import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors";
import { sendError } from "../utils/response";

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof AppError) {
    return sendError(res, error.statusCode, error.code, error.message);
  }

  return sendError(
    res,
    500,
    "INTERNAL_ERROR",
    "Something went wrong. Please try again.",
  );
}

export function notFoundHandler(_req: Request, res: Response) {
  return sendError(res, 404, "NOT_FOUND", "This endpoint does not exist.");
}
