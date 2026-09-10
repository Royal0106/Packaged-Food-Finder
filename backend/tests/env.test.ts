import { describe, expect, it } from "vitest";
import { loadEnv, normalizeOrigin } from "../src/config/env";

const required = {
  DATABASE_URL: "mysql://user:password@localhost:3306/food_search",
  STRIPE_SECRET_KEY: "sk_test_123456789",
  STRIPE_WEBHOOK_SECRET: "whsec_test_secret",
  STRIPE_PRICE_ID: "price_test_123",
};

describe("FRONTEND_URL", () => {
  it("strips trailing slashes so CORS origin matches the browser", () => {
    const env = loadEnv({
      ...required,
      FRONTEND_URL: "https://frontend-fawn-psi-81.vercel.app/",
    });

    expect(env.FRONTEND_URL).toBe("https://frontend-fawn-psi-81.vercel.app");
  });

  it("leaves an origin without a trailing slash unchanged", () => {
    expect(normalizeOrigin("http://localhost:3000")).toBe("http://localhost:3000");
  });
});
