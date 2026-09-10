import { beforeEach } from "vitest";
import { resetMemoryStore } from "../src/lib/memoryStore";
import { setMysqlMode } from "../src/lib/mysqlMode";

process.env.DATABASE_URL ??= "mysql://user:password@localhost:3306/food_search";
process.env.PORT ??= "4000";
process.env.FRONTEND_URL ??= "http://localhost:3000";
process.env.STRIPE_SECRET_KEY ??= "sk_test_123456789";
process.env.STRIPE_WEBHOOK_SECRET ??= "whsec_test_secret";
process.env.STRIPE_PRICE_ID ??= "price_test_123";

beforeEach(() => {
  setMysqlMode("up");
  resetMemoryStore();
});
