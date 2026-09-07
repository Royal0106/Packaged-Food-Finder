import type { Request, Response } from "express";
import {
  getProduct,
  getProtectedNutrition,
  searchProducts,
} from "../services/product.service";
import { sendSuccess } from "../utils/response";

export async function searchProductsHandler(req: Request, res: Response) {
  const data = await searchProducts(req.query.q, req.query.lang);
  return sendSuccess(res, data);
}

export async function getProductHandler(req: Request, res: Response) {
  const product = await getProduct(req.params.code, req.query.lang);
  return sendSuccess(res, product);
}

export async function getProductNutritionHandler(req: Request, res: Response) {
  const data = await getProtectedNutrition(req.params.code, req.query.lang);
  return sendSuccess(res, data);
}
