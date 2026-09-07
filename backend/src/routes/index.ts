import { Router } from "express";
import { getHealth } from "../controllers/health.controller";
import { productRouter } from "./product.routes";
import { searchHistoryRouter } from "./searchHistory.routes";
import { stripeRouter } from "./stripe.routes";
import { subscriptionRouter } from "./subscription.routes";

export const apiRouter = Router();

apiRouter.get("/health", getHealth);
apiRouter.use("/products", productRouter);
apiRouter.use("/search-history", searchHistoryRouter);
apiRouter.use("/stripe", stripeRouter);
apiRouter.use("/subscription", subscriptionRouter);
