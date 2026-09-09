import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getProtectedNutrition } = vi.hoisted(() => ({
  getProtectedNutrition: vi.fn(),
}));

vi.mock("../src/services/user.service", () => ({
  getDemoUser: vi.fn(),
  ensureDemoUser: vi.fn().mockResolvedValue({ id: 1 }),
}));

vi.mock("../src/services/product.service", async () => {
  const actual = await vi.importActual<typeof import("../src/services/product.service")>(
    "../src/services/product.service",
  );

  return {
    ...actual,
    getProtectedNutrition,
  };
});

import { createApp } from "../src/app";

describe("GET /api/products/:code/nutrition", () => {
  beforeEach(() => {
    getProtectedNutrition.mockReset();
  });

  it("returns no nutrition payload for an inactive subscriber", async () => {
    getProtectedNutrition.mockResolvedValue({
      hasAccess: false,
      nutrition: null,
    });

    const response = await request(createApp()).get("/api/products/123/nutrition");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { hasAccess: false, nutrition: null },
    });
  });

  it("returns nutrition only after the service confirms access", async () => {
    const nutrition = {
      energyKcal: 120,
      fat: 1,
      saturatedFat: null,
      carbohydrates: 20,
      sugars: 10,
      protein: 3,
      salt: 0.1,
      fiber: null,
    };
    getProtectedNutrition.mockResolvedValue({ hasAccess: true, nutrition });

    const response = await request(createApp()).get("/api/products/123/nutrition?lang=en");

    expect(response.status).toBe(200);
    expect(response.body.data.hasAccess).toBe(true);
    expect(response.body.data.nutrition).toEqual(nutrition);
  });
});
