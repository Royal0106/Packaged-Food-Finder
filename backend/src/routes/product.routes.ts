import { Router } from "express";
import {
  getProductHandler,
  getProductNutritionHandler,
  searchProductsHandler,
} from "../controllers/product.controller";
import { asyncHandler } from "../utils/asyncHandler";

export const productRouter = Router();

productRouter.get("/search", asyncHandler(searchProductsHandler));
productRouter.get("/:code/nutrition", asyncHandler(getProductNutritionHandler));
productRouter.get("/:code", asyncHandler(getProductHandler));
