import { PrismaClient } from "@prisma/client";

function withPrismaSsl(databaseUrl: string): string {
  try {
    const url = new URL(databaseUrl);
    if (url.searchParams.has("ssl-mode") && !url.searchParams.has("sslaccept")) {
      url.searchParams.delete("ssl-mode");
      url.searchParams.set("sslaccept", "strict");
    }
    return url.toString();
  } catch {
    return databaseUrl;
  }
}

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = withPrismaSsl(process.env.DATABASE_URL);
}

const globalForPrisma = globalThis as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
