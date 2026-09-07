import type {
  AppLanguage,
  Nutrition,
  OpenFoodFactsProduct,
  Product,
} from "../types/product";

const EMPTY_NUTRITION: Nutrition = {
  energyKcal: null,
  fat: null,
  saturatedFat: null,
  carbohydrates: null,
  sugars: null,
  protein: null,
  salt: null,
  fiber: null,
};

export function asTrimmedString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function asFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function localizeField(
  product: OpenFoodFactsProduct,
  baseField: string,
  language: AppLanguage,
): string | null {
  const localized = asTrimmedString(product[`${baseField}_${language}`]);
  if (localized) {
    return localized;
  }

  const generic = asTrimmedString(product[baseField]);
  if (generic) {
    return generic;
  }

  if (language !== "en") {
    const english = asTrimmedString(product[`${baseField}_en`]);
    if (english) {
      return english;
    }
  }

  return null;
}

export function splitCategories(value: string | null): string[] | null {
  if (!value) {
    return null;
  }

  const categories = value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .slice(0, 8);

  return categories.length > 0 ? categories : null;
}

export function normalizeNutrition(
  nutriments: Record<string, unknown> | undefined,
): Nutrition {
  if (!nutriments) {
    return { ...EMPTY_NUTRITION };
  }

  return {
    energyKcal: asFiniteNumber(
      nutriments["energy-kcal_100g"] ?? nutriments["energy-kcal"],
    ),
    fat: asFiniteNumber(nutriments.fat_100g ?? nutriments.fat),
    saturatedFat: asFiniteNumber(
      nutriments["saturated-fat_100g"] ?? nutriments["saturated-fat"],
    ),
    carbohydrates: asFiniteNumber(
      nutriments.carbohydrates_100g ?? nutriments.carbohydrates,
    ),
    sugars: asFiniteNumber(nutriments.sugars_100g ?? nutriments.sugars),
    protein: asFiniteNumber(nutriments.proteins_100g ?? nutriments.proteins),
    salt: asFiniteNumber(nutriments.salt_100g ?? nutriments.salt),
    fiber: asFiniteNumber(nutriments.fiber_100g ?? nutriments.fiber),
  };
}

export function normalizeProduct(
  raw: OpenFoodFactsProduct,
  language: AppLanguage,
): Product | null {
  const code = asTrimmedString(raw.code);
  if (!code) {
    return null;
  }

  const name =
    localizeField(raw, "product_name", language) ??
    asTrimmedString(raw.generic_name) ??
    "Unknown product";

  return {
    code,
    name,
    brand: asTrimmedString(raw.brands),
    imageUrl:
      asTrimmedString(raw.image_front_url) ?? asTrimmedString(raw.image_url),
    quantity: asTrimmedString(raw.quantity),
    categories: splitCategories(localizeField(raw, "categories", language)),
    ingredients: localizeField(raw, "ingredients_text", language),
  };
}

export function normalizeProducts(
  rawProducts: unknown,
  language: AppLanguage,
): Product[] {
  if (!Array.isArray(rawProducts)) {
    return [];
  }

  return rawProducts
    .map((item) =>
      item && typeof item === "object"
        ? normalizeProduct(item as OpenFoodFactsProduct, language)
        : null,
    )
    .filter((product): product is Product => product !== null);
}
