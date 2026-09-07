import { loadEnv } from "./env";

export const DEMO_USER = {
  id: 1,
  email: "demo@example.com",
  name: "Demo User",
} as const;

export const SEARCH_HISTORY_LIMIT = 12;
export const OPEN_FOOD_FACTS_TIMEOUT_MS = 20_000;
export const SEARCH_CACHE_TTL_MS = 2 * 60_000;
export const SUPPORTED_LANGUAGES = ["en", "nl", "de", "fr"] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

let cached: ReturnType<typeof loadEnv> | undefined;

export function getConfig() {
  if (!cached) {
    cached = loadEnv();
  }

  return cached;
}

export function resetConfigCache() {
  cached = undefined;
}
