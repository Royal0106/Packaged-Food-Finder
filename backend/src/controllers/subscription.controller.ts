import type { Request, Response } from "express";
import { getSubscriptionStatus } from "../services/subscription.service";
import { sendSuccess } from "../utils/response";

export async function getSubscriptionStatusHandler(_req: Request, res: Response) {
  const data = await getSubscriptionStatus();
  return sendSuccess(res, data);
}
