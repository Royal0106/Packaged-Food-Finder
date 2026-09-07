import { describe, expect, it, vi } from "vitest";
import { OpenFoodFactsService } from "../src/services/openFoodFacts.service";

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

describe("OpenFoodFactsService search", () => {
  it("reuses a cached result so repeating a recent query does not call the API again", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse({
        products: [{ code: "1", product_name: "Milk" }],
      }),
    );
    const service = new OpenFoodFactsService(fetchImpl as unknown as typeof fetch, 5_000);

    const first = await service.searchProducts("milk", "en");
    const second = await service.searchProducts("Milk", "en");

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(second).toEqual(first);
    expect(first[0]?.name).toBe("Milk");
  });

  it("retries a failed Open Food Facts request once", async () => {
    const fetchImpl = vi
      .fn()
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValueOnce(
        jsonResponse({
          products: [{ code: "2", product_name: "Oreo" }],
        }),
      );
    const service = new OpenFoodFactsService(fetchImpl as unknown as typeof fetch, 5_000);

    const products = await service.searchProducts("oreo", "en");

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(products[0]?.name).toBe("Oreo");
  });
});
