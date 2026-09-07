import type { SearchHistory } from "@prisma/client";
import { SEARCH_HISTORY_LIMIT } from "../config";
import { prisma } from "../lib/prisma";
import { Errors } from "../utils/errors";
import { getDemoUser } from "./user.service";

export async function recordSearch(query: string, language: string): Promise<void> {
  try {
    const user = await getDemoUser();
    const existing = await prisma.searchHistory.findFirst({
      where: {
        userId: user.id,
        query,
        language,
      },
    });

    if (existing) {
      await prisma.searchHistory.update({
        where: { id: existing.id },
        data: { createdAt: new Date() },
      });
    } else {
      await prisma.searchHistory.create({
        data: {
          userId: user.id,
          query,
          language,
        },
      });
    }

    await trimSearchHistory(user.id);
  } catch (error) {
    if (error instanceof Error && error.name === "AppError") {
      throw error;
    }
    throw Errors.databaseFailure();
  }
}

export async function listRecentSearches(): Promise<SearchHistory[]> {
  try {
    const user = await getDemoUser();
    return prisma.searchHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: SEARCH_HISTORY_LIMIT,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AppError") {
      throw error;
    }
    throw Errors.databaseFailure();
  }
}

async function trimSearchHistory(userId: number) {
  const extras = await prisma.searchHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    skip: SEARCH_HISTORY_LIMIT,
    select: { id: true },
  });

  if (extras.length === 0) {
    return;
  }

  await prisma.searchHistory.deleteMany({
    where: {
      id: { in: extras.map((item) => item.id) },
    },
  });
}
