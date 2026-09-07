import type { Response } from "express";
import type { ApiErrorBody, ApiSuccess } from "../types/api";

export function sendSuccess<T>(res: Response, data: T, statusCode = 200) {
  const body: ApiSuccess<T> = { success: true, data };
  return res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
) {
  const body: ApiErrorBody = {
    success: false,
    error: { code, message },
  };
  return res.status(statusCode).json(body);
}
