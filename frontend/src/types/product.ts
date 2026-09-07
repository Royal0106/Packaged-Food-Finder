export type Locale = "en" | "nl" | "de" | "fr";

export interface Product {
  code: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  quantity: string | null;
  categories: string[] | null;
  ingredients: string | null;
}

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

export interface SearchResult {
  query: string;
  language: Locale;
  products: Product[];
}

export interface SearchHistoryItem {
  id: number;
  query: string;
  language: Locale;
  createdAt: string;
}

export interface SubscriptionStatus {
  status: "inactive" | "active" | "canceled" | "past_due";
  hasAccess: boolean;
  currentPeriodEnd: string | null;
}

export interface NutritionAccess {
  hasAccess: boolean;
  nutrition: Nutrition | null;
}
