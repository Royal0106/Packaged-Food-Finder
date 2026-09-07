import {
  OPEN_FOOD_FACTS_TIMEOUT_MS,
  SEARCH_CACHE_TTL_MS,
  type SupportedLanguage,
} from "../config";
import type { Nutrition, OpenFoodFactsProduct, Product } from "../types/product";
import { Errors } from "../utils/errors";
import { normalizeNutrition, normalizeProduct, normalizeProducts } from "../utils/productMapper";

const LANGUAGE_HOSTS: Record<SupportedLanguage, string> = {
  en: "https://world.openfoodfacts.org",
  nl: "https://nl.openfoodfacts.org",
  de: "https://de.openfoodfacts.org",
  fr: "https://fr.openfoodfacts.org",
};

const SEARCH_FIELDS = [
  "code",
  "product_name",
  "product_name_en",
  "product_name_nl",
  "product_name_de",
  "product_name_fr",
  "generic_name",
  "brands",
  "image_url",
  "image_front_url",
  "quantity",
  "categories",
  "categories_en",
  "categories_nl",
  "categories_de",
  "categories_fr",
  "ingredients_text",
  "ingredients_text_en",
  "ingredients_text_nl",
  "ingredients_text_de",
  "ingredients_text_fr",
].join(",");

const DETAIL_FIELDS = `${SEARCH_FIELDS},nutriments`;

const USER_AGENT = "FoodLens/1.0 (https://github.com/foodlens; demo@example.com)";

interface SearchApiResponse {
  products?: unknown;
}

interface ProductApiResponse {
  status?: number;
  product?: OpenFoodFactsProduct;
}

interface CacheEntry {
  expiresAt: number;
  products: Product[];
}

export class OpenFoodFactsService {
  private readonly searchCache = new Map<string, CacheEntry>();

  constructor(
    private readonly fetchImpl: typeof fetch = fetch,
    private readonly timeoutMs: number = OPEN_FOOD_FACTS_TIMEOUT_MS,
  ) {}

  async searchProducts(query: string, language: SupportedLanguage): Promise<Product[]> {
    const cacheKey = `${language}:${query.toLowerCase()}`;
    const cached = this.searchCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.products;
    }

    const url = this.buildSearchUrl(LANGUAGE_HOSTS[language], query);

    try {
      const payload = await this.requestJson<SearchApiResponse>(url, 2);
      const products = normalizeProducts(payload.products, language);
      this.searchCache.set(cacheKey, {
        expiresAt: Date.now() + SEARCH_CACHE_TTL_MS,
        products,
      });
      return products;
    } catch (error) {
      if (language !== "en") {
        try {
          const fallback = await this.requestJson<SearchApiResponse>(
            this.buildSearchUrl(LANGUAGE_HOSTS.en, query),
            1,
          );
          return normalizeProducts(fallback.products, language);
        } catch {
          // Use the original error below.
        }
      }

      this.logFailure("search", url, error);
      throw Errors.productSearchFailed();
    }
  }

  async getProduct(code: string, language: SupportedLanguage): Promise<Product> {
    const product = await this.fetchRawProduct(code, language);
    const normalized = normalizeProduct(product, language);

    if (!normalized) {
      throw Errors.productNotFound();
    }

    return normalized;
  }

  async getNutrition(code: string, language: SupportedLanguage): Promise<Nutrition> {
    const product = await this.fetchRawProduct(code, language);
    return normalizeNutrition(product.nutriments);
  }

  private buildSearchUrl(host: string, query: string) {
    const url = new URL(`${host}/cgi/search.pl`);
    url.searchParams.set("search_terms", query);
    url.searchParams.set("search_simple", "1");
    url.searchParams.set("action", "process");
    url.searchParams.set("json", "1");
    url.searchParams.set("page_size", "24");
    url.searchParams.set("fields", SEARCH_FIELDS);
    return url;
  }

  private async fetchRawProduct(
    code: string,
    language: SupportedLanguage,
  ): Promise<OpenFoodFactsProduct> {
    const encodedCode = encodeURIComponent(code);
    const url = new URL(`${LANGUAGE_HOSTS[language]}/api/v2/product/${encodedCode}.json`);
    url.searchParams.set("fields", DETAIL_FIELDS);

    try {
      const payload = await this.requestJson<ProductApiResponse>(url, 2);
      if (payload.status !== 1 || !payload.product) {
        throw Errors.productNotFound();
      }
      return payload.product;
    } catch (error) {
      if (error instanceof Error && error.name === "AppError") {
        throw error;
      }
      this.logFailure("product", url, error);
      throw Errors.productLookupFailed();
    }
  }

  private async requestJson<T>(url: URL, attempts: number): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        return await this.requestJsonOnce<T>(url);
      } catch (error) {
        lastError = error;
        if (error instanceof Error && error.name === "AppError") {
          throw error;
        }
      }
    }

    throw lastError;
  }

  private async requestJsonOnce<T>(url: URL): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchImpl(url, {
        method: "GET",
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Open Food Facts HTTP ${response.status}`);
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timeout);
    }
  }

  private logFailure(operation: string, url: URL, error: unknown) {
    const reason = error instanceof Error ? error.message : "unknown error";
    console.error(`Open Food Facts ${operation} failed: ${reason} (${url.pathname})`);
  }
}

export const openFoodFactsService = new OpenFoodFactsService();
