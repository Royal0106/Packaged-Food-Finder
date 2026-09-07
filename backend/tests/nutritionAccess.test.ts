import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "@prisma/client";

const { getDemoUser, getNutrition } = vi.hoisted(() => ({
  getDemoUser: vi.fn(),
  getNutrition: vi.fn(),
}));

vi.mock("../src/services/user.service", () => ({
  getDemoUser,
  ensureDemoUser: vi.fn(),
}));

vi.mock("../src/services/openFoodFacts.service", () => ({
  openFoodFactsService: {
    getNutrition,
    getProduct: vi.fn(),
    searchProducts: vi.fn(),
  },
}));

import { getProtectedNutrition } from "../src/services/product.service";

function demoUser(status: User["subscriptionStatus"]): User {
  return {
    id: 1,
    email: "demo@example.com",
    name: "Demo User",
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    subscriptionStatus: status,
    subscriptionCurrentPeriodEnd: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe("nutrition access control", () => {
  beforeEach(() => {
    getDemoUser.mockReset();
    getNutrition.mockReset();
  });

  it("does not return nutrition when the subscription is inactive", async () => {
    getDemoUser.mockResolvedValue(demoUser("inactive"));

    const result = await getProtectedNutrition("3017620422003", "en");

    expect(result).toEqual({ hasAccess: false, nutrition: null });
    expect(getNutrition).not.toHaveBeenCalled();
  });

  it("returns protected nutrition for an active subscription", async () => {
    const nutrition = {
      energyKcal: 539,
      fat: 30.9,
      saturatedFat: 10.6,
      carbohydrates: 57.5,
      sugars: 56.3,
      protein: 6.3,
      salt: 0.1,
      fiber: null,
    };

    getDemoUser.mockResolvedValue(demoUser("active"));
    getNutrition.mockResolvedValue(nutrition);

    const result = await getProtectedNutrition("3017620422003", "en");

    expect(result).toEqual({ hasAccess: true, nutrition });
    expect(getNutrition).toHaveBeenCalledWith("3017620422003", "en");
  });
});
