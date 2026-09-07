import type { SupportedLanguage } from "../config";

export type AppLanguage = SupportedLanguage;

export interface Nutrition {
  energyKcal: number | null;
  fat: number | null;
  saturatedFat: number | null;
  carbohydrates: number | null;
  sugars: number | null;
  protein: number | null;
  salt: number | null;
  fiber: number | null;
}

export interface Product {
  code: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  quantity: string | null;
  categories: string[] | null;
  ingredients: string | null;
}

export interface OpenFoodFactsProduct {
  code?: unknown;
  product_name?: unknown;
  product_name_en?: unknown;
  product_name_nl?: unknown;
  product_name_de?: unknown;
  product_name_fr?: unknown;
  generic_name?: unknown;
  brands?: unknown;
  image_url?: unknown;
  image_front_url?: unknown;
  quantity?: unknown;
  categories?: unknown;
  categories_en?: unknown;
  categories_nl?: unknown;
  categories_de?: unknown;
  categories_fr?: unknown;
  ingredients_text?: unknown;
  ingredients_text_en?: unknown;
  ingredients_text_nl?: unknown;
  ingredients_text_de?: unknown;
  ingredients_text_fr?: unknown;
  nutriments?: Record<string, unknown>;
  [key: string]: unknown;
}
