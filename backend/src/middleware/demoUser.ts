import type { NextFunction, Request, Response } from "express";
import { ensureDemoUser } from "../services/user.service";

let demoUserReady: Promise<void> | undefined;

export function resetDemoUserReady() {
  demoUserReady = undefined;
}

function shouldSkipDemoUser(path: string): boolean {
  if (path === "/" || path.includes("/health")) {
    return true;
  }

  // Open Food Facts lookups should still work when MySQL is down.
  if (path === "/api/products/search") {
    return true;
  }

  return /^\/api\/products\/[^/]+$/.test(path);
}

export function ensureDemoUserMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (shouldSkipDemoUser(req.path)) {
    return next();
  }

  if (!demoUserReady) {
    demoUserReady = Promise.resolve(ensureDemoUser())
      .then(() => undefined)
      .catch((error: unknown) => {
        demoUserReady = undefined;
        throw error;
      });
  }

  void demoUserReady.then(() => next()).catch(next);
}
