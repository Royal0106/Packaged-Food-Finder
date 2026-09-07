import { Router } from "express";
import { createCheckoutSessionHandler } from "../controllers/stripe.controller";
import { asyncHandler } from "../utils/asyncHandler";

export const stripeRouter = Router();

stripeRouter.post(
  "/create-checkout-session",
  asyncHandler(createCheckoutSessionHandler),
);
