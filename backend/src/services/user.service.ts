import { DEMO_USER } from "../config";
import { prisma } from "../lib/prisma";
import { Errors } from "../utils/errors";

export async function ensureDemoUser() {
  return prisma.user.upsert({
    where: { email: DEMO_USER.email },
    create: {
      id: DEMO_USER.id,
      email: DEMO_USER.email,
      name: DEMO_USER.name,
      subscriptionStatus: "inactive",
    },
    update: {},
  });
}

export async function getDemoUser() {
  const user = await prisma.user.findUnique({
    where: { email: DEMO_USER.email },
  });

  if (!user) {
    throw Errors.demoUserMissing();
  }

  return user;
}
