import { DEMO_USER } from "../config";
import { memoryStore } from "../lib/memoryStore";
import { isUnreachableError, markMysqlDown, mysqlEnabled } from "../lib/mysqlMode";
import { prisma } from "../lib/prisma";
import { Errors } from "../utils/errors";

export async function ensureDemoUser() {
  if (!(await mysqlEnabled())) {
    return memoryStore.ensureUser();
  }

  try {
    return await prisma.user.upsert({
      where: { email: DEMO_USER.email },
      create: {
        id: DEMO_USER.id,
        email: DEMO_USER.email,
        name: DEMO_USER.name,
        subscriptionStatus: "inactive",
      },
      update: {},
    });
  } catch (error) {
    if (isUnreachableError(error)) {
      markMysqlDown();
      return memoryStore.ensureUser();
    }

    const reason = error instanceof Error ? error.message : "Unknown error";
    console.error(`Demo user init failed: ${reason}`);
    throw Errors.databaseFailure();
  }
}

export async function getDemoUser() {
  if (!(await mysqlEnabled())) {
    return memoryStore.getUser();
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: DEMO_USER.email },
    });

    if (!user) {
      throw Errors.demoUserMissing();
    }

    return user;
  } catch (error) {
    if (error instanceof Error && error.name === "AppError") {
      throw error;
    }

    if (isUnreachableError(error)) {
      markMysqlDown();
      return memoryStore.getUser();
    }

    throw error;
  }
}
