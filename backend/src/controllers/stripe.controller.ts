import type { Request, Response } from "express";
import {
  constructWebhookEvent,
  createCheckoutSession,
  handleStripeEvent,
} from "../services/stripe.service";
import { sendSuccess } from "../utils/response";

export async function createCheckoutSessionHandler(_req: Request, res: Response) {
  const data = await createCheckoutSession();
  return sendSuccess(res, data);
}

export async function stripeWebhookHandler(req: Request, res: Response) {
  const signature = req.headers["stripe-signature"];
  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from("");
  const event = constructWebhookEvent(
    rawBody,
    typeof signature === "string" ? signature : undefined,
  );

  await handleStripeEvent(event);
  return sendSuccess(res, { received: true });
}
