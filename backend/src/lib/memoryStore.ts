import type { SearchHistory, User } from "@prisma/client";
import { DEMO_USER, SEARCH_HISTORY_LIMIT } from "../config";

function createDemoUser(): User {
  const now = new Date();
  return {
    id: DEMO_USER.id,
    email: DEMO_USER.email,
    name: DEMO_USER.name,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    subscriptionStatus: "inactive",
    subscriptionCurrentPeriodEnd: null,
    createdAt: now,
    updatedAt: now,
  };
}

let user = createDemoUser();
let history: SearchHistory[] = [];
let nextHistoryId = 1;

export function resetMemoryStore() {
  user = createDemoUser();
  history = [];
  nextHistoryId = 1;
}

export const memoryStore = {
  ensureUser(): User {
    return { ...user };
  },

  getUser(): User {
    return { ...user };
  },

  updateUser(data: Partial<Omit<User, "id" | "email" | "createdAt">>): User {
    user = {
      ...user,
      ...data,
      updatedAt: new Date(),
    };
    return { ...user };
  },

  recordSearch(userId: number, query: string, language: string): void {
    const existing = history.find(
      (item) => item.userId === userId && item.query === query && item.language === language,
    );
    const others = history.filter((item) => item !== existing);

    history = [
      {
        id: existing?.id ?? nextHistoryId,
        userId,
        query,
        language,
        createdAt: new Date(),
      },
      ...others,
    ].slice(0, SEARCH_HISTORY_LIMIT);

    if (!existing) {
      nextHistoryId += 1;
    }
  },

  listSearches(userId: number): SearchHistory[] {
    return history
      .filter((item) => item.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, SEARCH_HISTORY_LIMIT)
      .map((item) => ({ ...item }));
  },
};
