import "dotenv/config";
import { getConfig } from "./config";
import { createApp } from "./app";
import { prisma } from "./lib/prisma";
import { ensureDemoUser } from "./services/user.service";

async function start() {
  const config = getConfig();
  await ensureDemoUser();

  const app = createApp();
  const server = app.listen(config.PORT, () => {
    console.log(`FoodLens API listening on http://localhost:${config.PORT}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => {
    void shutdown();
  });
  process.on("SIGTERM", () => {
    void shutdown();
  });
}

start().catch((error: unknown) => {
  console.error("Failed to start server");
  console.error(error instanceof Error ? error.message : "Unknown error");
  process.exit(1);
});
