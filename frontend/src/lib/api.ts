import type {
  Locale,
  NutritionAccess,
  Product,
  SearchHistoryItem,
  SearchResult,
  SubscriptionStatus,
} from "@/types/product";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 0,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function isServerError(error: unknown) {
  return (
    error instanceof ApiError &&
    (error.status >= 500 ||
      error.code === "PRODUCT_SEARCH_FAILED" ||
      error.code === "PRODUCT_LOOKUP_FAILED" ||
      error.code === "NETWORK_ERROR")
  );
}

interface SuccessBody<T> {
  success: true;
  data: T;
}

interface ErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError("NETWORK_ERROR", "Unable to reach the server.", 0);
  }

  let payload: SuccessBody<T> | ErrorBody;

  try {
    payload = (await response.json()) as SuccessBody<T> | ErrorBody;
  } catch {
    throw new ApiError("INVALID_RESPONSE", "Unable to read the server response.", response.status);
  }

  if (!payload.success) {
    throw new ApiError(payload.error.code, payload.error.message, response.status);
  }

  return payload.data;
}

export function searchProducts(query: string, lang: Locale) {
  const params = new URLSearchParams({ q: query, lang });
  return request<SearchResult>(`/api/products/search?${params.toString()}`);
}

export function getProduct(code: string, lang: Locale) {
  const params = new URLSearchParams({ lang });
  return request<Product>(`/api/products/${encodeURIComponent(code)}?${params}`);
}

export function getProductNutrition(code: string, lang: Locale) {
  const params = new URLSearchParams({ lang });
  return request<NutritionAccess>(
    `/api/products/${encodeURIComponent(code)}/nutrition?${params}`,
  );
}

export function getSearchHistory() {
  return request<SearchHistoryItem[]>("/api/search-history");
}

export function getSubscriptionStatus() {
  return request<SubscriptionStatus>("/api/subscription/status");
}

export function createCheckoutSession() {
  return request<{ url: string }>("/api/stripe/create-checkout-session", {
    method: "POST",
  });
}
