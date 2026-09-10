import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/services/user.service", () => ({
  getDemoUser: vi.fn(),
  ensureDemoUser: vi.fn().mockResolvedValue({ id: 1 }),
}));

import { createApp } from "../src/app";
import { resetConfigCache } from "../src/config";

const FRONTEND_ORIGIN = "https://frontend-fawn-psi-81.vercel.app";

describe("CORS", () => {
  const previousFrontendUrl = process.env.FRONTEND_URL;

  beforeEach(() => {
    process.env.FRONTEND_URL = `${FRONTEND_ORIGIN}/`;
    resetConfigCache();
  });

  afterEach(() => {
    process.env.FRONTEND_URL = previousFrontendUrl;
    resetConfigCache();
  });

  it("reflects the browser origin when FRONTEND_URL has a trailing slash", async () => {
    const response = await request(createApp())
      .get("/api/health")
      .set("Origin", FRONTEND_ORIGIN);

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe(FRONTEND_ORIGIN);
  });

  it("allows a GET preflight from the configured frontend origin", async () => {
    const response = await request(createApp())
      .options("/api/search-history")
      .set("Origin", FRONTEND_ORIGIN)
      .set("Access-Control-Request-Method", "GET");

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe(FRONTEND_ORIGIN);
  });
});
