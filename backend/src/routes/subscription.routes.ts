import { Router } from "express";
import { getSubscriptionStatusHandler } from "../controllers/subscription.controller";
import { asyncHandler } from "../utils/asyncHandler";

export const subscriptionRouter = Router();

subscriptionRouter.get("/status", asyncHandler(getSubscriptionStatusHandler));
