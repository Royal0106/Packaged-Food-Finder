import cors from "cors";
import express from "express";
import { getConfig } from "./config";
import { normalizeOrigin } from "./config/env";
import { stripeWebhookHandler } from "./controllers/stripe.controller";
import { ensureDemoUserMiddleware } from "./middleware/demoUser";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { apiRouter } from "./routes";
import { asyncHandler } from "./utils/asyncHandler";

export function createApp() {
  const app = express();
  const config = getConfig();
  const allowedOrigin = normalizeOrigin(config.FRONTEND_URL);

  app.disable("x-powered-by");
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || normalizeOrigin(origin) === allowedOrigin) {
          callback(null, true);
          return;
        }

        callback(null, false);
      },
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Stripe-Signature"],
    }),
  );
  app.use(ensureDemoUserMiddleware);

  app.get("/", (_req, res) => {
    res.json({
      success: true,
      data: {
        name: "FoodLens API",
        status: "ok",
        health: "/api/health",
      },
    });
  });

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

// Vercel (and other serverless hosts) require a default export that is the
// Express app itself, not a factory function and not app.listen().
const app = createApp();
export default app;
