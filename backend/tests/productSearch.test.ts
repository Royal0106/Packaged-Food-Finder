import { beforeEach, describe, expect, it, vi } from "vitest";

const { recordSearch, searchProducts } = vi.hoisted(() => ({
  recordSearch: vi.fn(),
  searchProducts: vi.fn(),
}));

vi.mock("../src/services/searchHistory.service", () => ({
  recordSearch,
  listRecentSearches: vi.fn(),
}));

vi.mock("../src/services/user.service", () => ({
  getDemoUser: vi.fn(),
  ensureDemoUser: vi.fn(),
}));

vi.mock("../src/services/openFoodFacts.service", () => ({
  openFoodFactsService: {
    searchProducts,
    getProduct: vi.fn(),
    getNutrition: vi.fn(),
  },
}));

import { searchProducts as searchProductsService } from "../src/services/product.service";

describe("searchProducts history writes", () => {
  beforeEach(() => {
    recordSearch.mockReset();
    searchProducts.mockReset();
    searchProducts.mockResolvedValue([{ code: "1", name: "Milk" }]);
  });

  it("still returns Open Food Facts results when history cannot be saved", async () => {
    recordSearch.mockRejectedValue(new Error("Can't reach database server"));

    await expect(searchProductsService("milk", "en")).resolves.toEqual({
      query: "milk",
      language: "en",
      products: [{ code: "1", name: "Milk" }],
    });
  });
});
