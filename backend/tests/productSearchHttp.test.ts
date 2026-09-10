import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { ensureDemoUser, searchProducts, listRecentSearches } = vi.hoisted(() => ({
  ensureDemoUser: vi.fn(),
  searchProducts: vi.fn(),
  listRecentSearches: vi.fn(),
}));

vi.mock("../src/services/user.service", () => ({
  getDemoUser: vi.fn(),
  ensureDemoUser,
}));

vi.mock("../src/services/openFoodFacts.service", () => ({
  openFoodFactsService: {
    searchProducts,
    getProduct: vi.fn(),
    getNutrition: vi.fn(),
  },
}));

vi.mock("../src/services/searchHistory.service", () => ({
  recordSearch: vi.fn().mockRejectedValue(new Error("database down")),
  listRecentSearches,
}));

import { createApp } from "../src/app";
import { resetDemoUserReady } from "../src/middleware/demoUser";

describe("database-independent product search", () => {
  beforeEach(() => {
    resetDemoUserReady();
    ensureDemoUser.mockReset();
    searchProducts.mockReset();
    listRecentSearches.mockReset();
    searchProducts.mockResolvedValue([
      { code: "1", name: "Oreo", brand: "Oreo", imageUrl: null },
    ]);
  });

  it("does not block product search on demo-user MySQL upsert", async () => {
    ensureDemoUser.mockRejectedValue(new Error("Can't reach database server"));

    const response = await request(createApp()).get("/api/products/search?q=oreo");

    expect(response.status).toBe(200);
    expect(response.body.data.products).toHaveLength(1);
    expect(ensureDemoUser).not.toHaveBeenCalled();
  });

  it("retries demo-user init after a failed MySQL connection", async () => {
    const app = createApp();
    listRecentSearches.mockResolvedValue([]);
    ensureDemoUser
      .mockRejectedValueOnce(new Error("Can't reach database server"))
      .mockResolvedValueOnce({ id: 1 });

    const first = await request(app).get("/api/search-history");
    const second = await request(app).get("/api/search-history");

    expect(first.status).toBe(500);
    expect(second.status).toBe(200);
    expect(ensureDemoUser).toHaveBeenCalledTimes(2);
  });
});
