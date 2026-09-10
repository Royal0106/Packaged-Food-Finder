import { PrismaClient } from "@prisma/client";

export function prepareDatabaseUrl(databaseUrl: string): string {
  try {
    const url = new URL(databaseUrl);
    const sslMode = url.searchParams.get("ssl-mode");

    if (sslMode && !url.searchParams.has("sslaccept")) {
      url.searchParams.delete("ssl-mode");
      const verifyPeer =
        sslMode.toUpperCase() === "VERIFY_CA" ||
        sslMode.toUpperCase() === "VERIFY_IDENTITY";
      // MySQL REQUIRED encrypts but does not verify the CA. Aiven uses its own
      // CA, which is not in Vercel's trust store.
      url.searchParams.set(
        "sslaccept",
        verifyPeer ? "strict" : "accept_invalid_certs",
      );
    }

    if (
      url.hostname.endsWith("aivencloud.com") &&
      !url.searchParams.has("sslaccept")
    ) {
      url.searchParams.set("sslaccept", "accept_invalid_certs");
    }

    if (!url.searchParams.has("connect_timeout")) {
      url.searchParams.set("connect_timeout", "15");
    }

    if (!url.searchParams.has("connection_limit")) {
      url.searchParams.set("connection_limit", "1");
    }

    return url.toString();
  } catch {
    return databaseUrl;
  }
}

const databaseUrl = process.env.DATABASE_URL
  ? prepareDatabaseUrl(process.env.DATABASE_URL)
  : undefined;

if (databaseUrl) {
  process.env.DATABASE_URL = databaseUrl;
}

const globalForPrisma = globalThis as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(
    databaseUrl ? { datasources: { db: { url: databaseUrl } } } : undefined,
  );

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
