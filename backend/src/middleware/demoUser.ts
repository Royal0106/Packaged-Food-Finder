import type { NextFunction, Request, Response } from "express";
import { ensureDemoUser } from "../services/user.service";

let demoUserReady: Promise<void> | undefined;

export function ensureDemoUserMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (req.path === "/" || req.path.includes("/health")) {
    return next();
  }

  if (!demoUserReady) {
    demoUserReady = Promise.resolve(ensureDemoUser()).then(() => undefined);
  }

  void demoUserReady.then(() => next()).catch(next);
}
