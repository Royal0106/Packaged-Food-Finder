import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_USER = {
  id: 1,
  email: "demo@example.com",
  name: "Demo User",
} as const;

async function main() {
  await prisma.user.upsert({
    where: { email: DEMO_USER.email },
    create: {
      id: DEMO_USER.id,
      email: DEMO_USER.email,
      name: DEMO_USER.name,
      subscriptionStatus: "inactive",
    },
    update: {
      name: DEMO_USER.name,
    },
  });

  console.log(`Seeded demo user: ${DEMO_USER.email}`);
}

main()
  .catch((error: unknown) => {
    console.error("Failed to seed database", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
