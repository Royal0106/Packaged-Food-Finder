import { beforeEach, describe, expect, it } from "vitest";
import { resetMemoryStore } from "../src/lib/memoryStore";
import { getMysqlTarget, isUnreachableError, setMysqlMode } from "../src/lib/mysqlMode";
import { listRecentSearches, recordSearch } from "../src/services/searchHistory.service";
import { ensureDemoUser } from "../src/services/user.service";

describe("in-memory fallback store", () => {
  beforeEach(() => {
    setMysqlMode("down");
    resetMemoryStore();
  });

  it("serves the demo user and search history without MySQL", async () => {
    const user = await ensureDemoUser();
    expect(user.email).toBe("demo@example.com");

    await recordSearch("Nutella", "en");
    await recordSearch("Nutella", "en");
    await recordSearch("Oreo", "en");

    const history = await listRecentSearches();
    expect(history.map((item) => item.query)).toEqual(["Oreo", "Nutella"]);
  });

  it("treats Prisma P1001 as an unreachable database", () => {
    expect(isUnreachableError({ code: "P1001", message: "Can't reach database server" })).toBe(
      true,
    );
    expect(getMysqlTarget("mysql://user:pass@db.example.com:21461/defaultdb")).toEqual({
      host: "db.example.com",
      port: 21461,
    });
  });
});
