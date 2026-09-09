import type { NextFunction, Request, Response } from "express";
import { ensureDemoUser } from "../services/user.service";

let demoUserReady: Promise<void> | undefined;

export function ensureDemoUserMiddleware(
  _req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (!demoUserReady) {
    demoUserReady = Promise.resolve(ensureDemoUser()).then(() => undefined);
  }

  void demoUserReady.then(() => next()).catch(next);
}
