import { describe, expect, it } from "vitest";
import {
  localizeField,
  normalizeNutrition,
  normalizeProduct,
  normalizeProducts,
} from "../src/utils/productMapper";
import type { OpenFoodFactsProduct } from "../src/types/product";

describe("Open Food Facts normalization", () => {
  it("maps missing fields to null without throwing", () => {
    const product = normalizeProduct({ code: "123" }, "en");

    expect(product).toEqual({
      code: "123",
      name: "Unknown product",
      brand: null,
      imageUrl: null,
      quantity: null,
      categories: null,
      ingredients: null,
    });
  });

  it("prefers the selected language, then generic, then English", () => {
    const raw: OpenFoodFactsProduct = {
      code: "3017620422003",
      product_name_nl: "Nutella NL",
      product_name: "Nutella",
      product_name_en: "Nutella EN",
      brands: "Ferrero",
      quantity: "400 g",
      categories_nl: "Smeersels, Chocoladepasta",
      ingredients_text_nl: "Suiker, palmolie",
      image_front_url: "https://example.com/nutella.jpg",
    };

    const dutch = normalizeProduct(raw, "nl");
    expect(dutch?.name).toBe("Nutella NL");
    expect(dutch?.categories).toEqual(["Smeersels", "Chocoladepasta"]);
    expect(dutch?.ingredients).toBe("Suiker, palmolie");

    const french = normalizeProduct(
      {
        ...raw,
        product_name_nl: undefined,
        product_name_fr: undefined,
      },
      "fr",
    );
    expect(french?.name).toBe("Nutella");
  });

  it("uses localizeField fallbacks in the documented order", () => {
    expect(
      localizeField({ product_name_de: "Schokolade" }, "product_name", "de"),
    ).toBe("Schokolade");
    expect(localizeField({ product_name: "Chocolate" }, "product_name", "de")).toBe(
      "Chocolate",
    );
    expect(
      localizeField({ product_name_en: "Chocolate EN" }, "product_name", "de"),
    ).toBe("Chocolate EN");
    expect(localizeField({}, "product_name", "de")).toBeNull();
  });

  it("normalizes nutrition and leaves missing values as null", () => {
    expect(normalizeNutrition(undefined)).toEqual({
      energyKcal: null,
      fat: null,
      saturatedFat: null,
      carbohydrates: null,
      sugars: null,
      protein: null,
      salt: null,
      fiber: null,
    });

    expect(
      normalizeNutrition({
        "energy-kcal_100g": 539,
        fat_100g: "30.9",
        sugars_100g: "not-a-number",
      }),
    ).toEqual({
      energyKcal: 539,
      fat: 30.9,
      saturatedFat: null,
      carbohydrates: null,
      sugars: null,
      protein: null,
      salt: null,
      fiber: null,
    });
  });

  it("skips malformed products without a barcode", () => {
    expect(normalizeProducts([{ product_name: "No code" }, null, "bad"], "en")).toEqual(
      [],
    );
  });
});
