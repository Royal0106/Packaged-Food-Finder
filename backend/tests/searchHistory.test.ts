import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, getDemoUser } = vi.hoisted(() => ({
  getDemoUser: vi.fn(),
  prismaMock: {
    searchHistory: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
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

import { listRecentSearches, recordSearch } from "../src/services/searchHistory.service";

describe("search history", () => {
  beforeEach(() => {
    getDemoUser.mockResolvedValue({ id: 1, email: "demo@example.com" });
    prismaMock.searchHistory.findFirst.mockReset();
    prismaMock.searchHistory.findMany.mockReset();
    prismaMock.searchHistory.create.mockReset();
    prismaMock.searchHistory.update.mockReset();
    prismaMock.searchHistory.deleteMany.mockReset();
  });

  it("creates a new search history record", async () => {
    prismaMock.searchHistory.findFirst.mockResolvedValue(null);
    prismaMock.searchHistory.create.mockResolvedValue({ id: 10 });
    prismaMock.searchHistory.findMany.mockResolvedValue([]);

    await recordSearch("Nutella", "en");

    expect(prismaMock.searchHistory.create).toHaveBeenCalledWith({
      data: {
        userId: 1,
        query: "Nutella",
        language: "en",
      },
    });
    expect(prismaMock.searchHistory.update).not.toHaveBeenCalled();
  });

  it("deduplicates an identical recent search instead of inserting again", async () => {
    prismaMock.searchHistory.findFirst.mockResolvedValue({ id: 4, query: "Oreo" });
    prismaMock.searchHistory.findMany.mockResolvedValue([]);

    await recordSearch("Oreo", "en");

    expect(prismaMock.searchHistory.create).not.toHaveBeenCalled();
    expect(prismaMock.searchHistory.update).toHaveBeenCalledWith({
      where: { id: 4 },
      data: { createdAt: expect.any(Date) },
    });
  });

  it("returns recent searches newest first", async () => {
    const rows = [
      { id: 2, query: "Milk", language: "en", createdAt: new Date() },
      { id: 1, query: "Oreo", language: "en", createdAt: new Date() },
    ];
    prismaMock.searchHistory.findMany.mockResolvedValue(rows);

    await expect(listRecentSearches()).resolves.toEqual(rows);
    expect(prismaMock.searchHistory.findMany).toHaveBeenCalledWith({
      where: { userId: 1 },
      orderBy: { createdAt: "desc" },
      take: 12,
    });
  });
});
