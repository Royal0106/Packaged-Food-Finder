import { z } from "zod";
import { SUPPORTED_LANGUAGES } from "../config";
import type { Nutrition, Product } from "../types/product";
import { Errors } from "../utils/errors";
import { hasPremiumAccess } from "../utils/subscription";
import { openFoodFactsService } from "./openFoodFacts.service";
import { recordSearch } from "./searchHistory.service";
import { getDemoUser } from "./user.service";

const searchSchema = z.object({
  q: z.string().trim().min(1).max(120),
  lang: z.enum(SUPPORTED_LANGUAGES).default("en"),
});

const productCodeSchema = z.string().trim().min(1).max(32);
const languageSchema = z.enum(SUPPORTED_LANGUAGES).default("en");

export function parseSearchQuery(input: { q?: unknown; lang?: unknown }) {
  const parsed = searchSchema.safeParse({
    q: input.q,
    lang: input.lang ?? "en",
  });

  if (!parsed.success) {
    const isLanguageIssue = parsed.error.issues.some((issue) =>
      issue.path.includes("lang"),
    );
    throw isLanguageIssue ? Errors.invalidLanguage() : Errors.invalidQuery();
  }

  return parsed.data;
}

export function parseProductCode(code: unknown) {
  const parsed = productCodeSchema.safeParse(code);
  if (!parsed.success) {
    throw Errors.productNotFound();
  }
  return parsed.data;
}

export function parseLanguage(lang: unknown) {
  const parsed = languageSchema.safeParse(lang ?? "en");
  if (!parsed.success) {
    throw Errors.invalidLanguage();
  }
  return parsed.data;
}

export async function searchProducts(rawQuery: unknown, rawLang: unknown) {
  const { q, lang } = parseSearchQuery({ q: rawQuery, lang: rawLang });
  const products = await openFoodFactsService.searchProducts(q, lang);
  await recordSearch(q, lang);
  return { query: q, language: lang, products };
}

export async function getProduct(rawCode: unknown, rawLang: unknown): Promise<Product> {
  const code = parseProductCode(rawCode);
  const lang = parseLanguage(rawLang);
  return openFoodFactsService.getProduct(code, lang);
}

export async function getProtectedNutrition(
  rawCode: unknown,
  rawLang: unknown,
): Promise<{ hasAccess: boolean; nutrition: Nutrition | null }> {
  const user = await getDemoUser();

  if (!hasPremiumAccess(user.subscriptionStatus)) {
    return { hasAccess: false, nutrition: null };
  }

  const code = parseProductCode(rawCode);
  const lang = parseLanguage(rawLang);
  const nutrition = await openFoodFactsService.getNutrition(code, lang);

  return { hasAccess: true, nutrition };
}
