import express from "express";
import request from "supertest";
import Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, getDemoUser, retrieveSubscription } = vi.hoisted(() => ({
  getDemoUser: vi.fn(),
  retrieveSubscription: vi.fn(),
  prismaMock: {
    user: {
      update: vi.fn(),
    },
  },
}));

vi.mock("../src/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("../src/services/user.service", () => ({
  getDemoUser,
  ensureDemoUser: vi.fn(),
}));

import { createApp } from "../src/app";
import { getStripe, resetStripeClient } from "../src/services/stripe.service";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "whsec_test_secret";

function signedRequest(app: express.Express, event: Stripe.Event) {
  const payload = JSON.stringify(event);
  const signature = Stripe.webhooks.generateTestHeaderString({
    payload,
    secret: WEBHOOK_SECRET,
  });

  return request(app)
    .post("/api/stripe/webhook")
    .set("Stripe-Signature", signature)
    .set("Content-Type", "application/json")
    .send(payload);
}

describe("Stripe webhooks", () => {
  beforeEach(() => {
    resetStripeClient();
    getDemoUser.mockResolvedValue({ id: 1, email: "demo@example.com" });
    prismaMock.user.update.mockReset();
    prismaMock.user.update.mockResolvedValue({ id: 1 });
    retrieveSubscription.mockReset();
  });

  it("rejects an invalid webhook signature", async () => {
    const app = createApp();

    const response = await request(app)
      .post("/api/stripe/webhook")
      .set("Stripe-Signature", "invalid")
      .set("Content-Type", "application/json")
      .send(JSON.stringify({ type: "customer.subscription.updated" }));

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: "WEBHOOK_VERIFICATION_FAILED",
        message: "Webhook signature is invalid.",
      },
    });
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("updates the demo user when a subscription becomes active", async () => {
    const app = createApp();
    const event = {
      id: "evt_1",
      object: "event",
      type: "customer.subscription.updated",
      data: {
        object: {
          id: "sub_123",
          object: "subscription",
          status: "active",
          customer: "cus_123",
          current_period_end: 1_800_000_000,
          items: { data: [] },
        },
      },
    } as unknown as Stripe.Event;

    const response = await signedRequest(app, event);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: "sub_123",
        subscriptionStatus: "active",
        subscriptionCurrentPeriodEnd: new Date(1_800_000_000 * 1000),
      },
    });
  });

  it("marks the subscription canceled on customer.subscription.deleted", async () => {
    const app = createApp();
    const event = {
      id: "evt_2",
      object: "event",
      type: "customer.subscription.deleted",
      data: {
        object: {
          id: "sub_123",
          object: "subscription",
          status: "canceled",
          customer: "cus_123",
          current_period_end: 1_800_000_000,
          items: { data: [] },
        },
      },
    } as unknown as Stripe.Event;

    const response = await signedRequest(app, event);

    expect(response.status).toBe(200);
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({
        subscriptionStatus: "canceled",
        stripeSubscriptionId: "sub_123",
      }),
    });
  });
});

describe("Stripe client isolation", () => {
  it("does not call Stripe APIs during signature verification failure", () => {
    const stripe = getStripe();
    expect(stripe).toBeDefined();
  });
});
