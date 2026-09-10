import { describe, expect, it } from "vitest";
import { prepareDatabaseUrl } from "../src/lib/prisma";

describe("prepareDatabaseUrl", () => {
  it("maps Aiven ssl-mode=REQUIRED to Prisma sslaccept without verifying a public CA", () => {
    const prepared = prepareDatabaseUrl(
      "mysql://avnadmin:secret@mysql.example.h.aivencloud.com:21461/defaultdb?ssl-mode=REQUIRED",
    );

    expect(prepared).toContain("sslaccept=accept_invalid_certs");
    expect(prepared).not.toContain("ssl-mode");
    expect(prepared).toContain("connect_timeout=15");
    expect(prepared).toContain("connection_limit=1");
    expect(prepared).toContain("mysql://avnadmin:secret@");
  });

  it("keeps an explicit sslaccept value", () => {
    const prepared = prepareDatabaseUrl(
      "mysql://user:password@localhost:3306/food_search?sslaccept=strict",
    );

    expect(prepared).toContain("sslaccept=strict");
    expect(prepared).toContain("connect_timeout=15");
  });
});
