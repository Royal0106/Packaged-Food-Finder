import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("../src/lib/prisma", () => ({
  prisma: prismaMock,
}));

import { resetMemoryStore } from "../src/lib/memoryStore";
import { setMysqlMode } from "../src/lib/mysqlMode";
import { ensureDemoUser, getDemoUser } from "../src/services/user.service";

describe("ensureDemoUser", () => {
  beforeEach(() => {
    prismaMock.user.upsert.mockReset();
    prismaMock.user.findUnique.mockReset();
    setMysqlMode("up");
    resetMemoryStore();
  });

  it("falls back to the in-memory demo user when MySQL is unreachable", async () => {
    prismaMock.user.upsert.mockRejectedValue(
      new Error("Can't reach database server at mysql.example:21461"),
    );

    const user = await ensureDemoUser();

    expect(user.email).toBe("demo@example.com");
    expect(user.subscriptionStatus).toBe("inactive");
    expect(prismaMock.user.upsert).toHaveBeenCalledOnce();
  });

  it("skips Prisma when MySQL has already been marked unreachable", async () => {
    setMysqlMode("down");

    const user = await getDemoUser();

    expect(user.email).toBe("demo@example.com");
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });
});
