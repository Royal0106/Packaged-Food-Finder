import { describe, expect, it } from "vitest";
import { hasPremiumAccess, mapStripeSubscriptionStatus } from "../src/utils/subscription";

describe("subscription mapping", () => {
  it("grants access only for an active application status", () => {
    expect(hasPremiumAccess("active")).toBe(true);
    expect(hasPremiumAccess("inactive")).toBe(false);
    expect(hasPremiumAccess("canceled")).toBe(false);
    expect(hasPremiumAccess("past_due")).toBe(false);
  });

  it("maps Stripe subscription states to application statuses", () => {
    expect(mapStripeSubscriptionStatus("active")).toBe("active");
    expect(mapStripeSubscriptionStatus("trialing")).toBe("active");
    expect(mapStripeSubscriptionStatus("past_due")).toBe("past_due");
    expect(mapStripeSubscriptionStatus("unpaid")).toBe("past_due");
    expect(mapStripeSubscriptionStatus("canceled")).toBe("canceled");
    expect(mapStripeSubscriptionStatus("incomplete_expired")).toBe("canceled");
    expect(mapStripeSubscriptionStatus("incomplete")).toBe("inactive");
  });
});
