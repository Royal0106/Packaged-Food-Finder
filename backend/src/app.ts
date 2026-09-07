import cors from "cors";
import express from "express";
import { getConfig } from "./config";
import { stripeWebhookHandler } from "./controllers/stripe.controller";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { apiRouter } from "./routes";
import { asyncHandler } from "./utils/asyncHandler";

export function createApp() {
  const app = express();
  const config = getConfig();

  app.disable("x-powered-by");
  app.use(
    cors({
      origin: config.FRONTEND_URL,
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Stripe-Signature"],
    }),
  );

  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    asyncHandler(stripeWebhookHandler),
  );

  app.use(express.json());
  app.use("/api", apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
