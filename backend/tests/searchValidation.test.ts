import { describe, expect, it } from "vitest";
import { parseSearchQuery } from "../src/services/product.service";
import { AppError } from "../src/utils/errors";

describe("search validation", () => {
  it("rejects an empty query", () => {
    expect(() => parseSearchQuery({ q: "   ", lang: "en" })).toThrow(AppError);
    expect(() => parseSearchQuery({ q: "", lang: "en" })).toThrow(AppError);
    expect(() => parseSearchQuery({})).toThrow(AppError);

    try {
      parseSearchQuery({ q: "  " });
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("INVALID_QUERY");
      expect((error as AppError).statusCode).toBe(400);
    }
  });

  it("accepts a trimmed query and a supported language", () => {
    expect(parseSearchQuery({ q: "  Nutella  ", lang: "nl" })).toEqual({
      q: "Nutella",
      lang: "nl",
    });
  });

  it("rejects an unsupported language", () => {
    try {
      parseSearchQuery({ q: "Oreo", lang: "es" });
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("INVALID_LANGUAGE");
    }
  });
});
