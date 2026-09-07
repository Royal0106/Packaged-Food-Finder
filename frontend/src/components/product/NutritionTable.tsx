"use client";

import { useI18n } from "@/context/LocaleContext";
import type { Nutrition } from "@/types/product";
import type { MessageKey } from "@/lib/i18n";

const ROWS: Array<{
  key: keyof Nutrition;
  label: MessageKey;
  unit: string;
}> = [
  { key: "energyKcal", label: "energy", unit: "kcal" },
  { key: "fat", label: "fat", unit: "g" },
  { key: "saturatedFat", label: "saturatedFat", unit: "g" },
  { key: "carbohydrates", label: "carbohydrates", unit: "g" },
  { key: "sugars", label: "sugars", unit: "g" },
  { key: "protein", label: "protein", unit: "g" },
  { key: "salt", label: "salt", unit: "g" },
  { key: "fiber", label: "fiber", unit: "g" },
];

export function NutritionTable({ nutrition }: { nutrition: Nutrition }) {
  const { t } = useI18n();
  const available = ROWS.filter((row) => nutrition[row.key] !== null);

  if (available.length === 0) {
    return <p className="text-ink-muted">{t("notAvailable")}</p>;
  }

  return (
    <table className="w-full text-left">
      <caption className="sr-only">{t("nutritionPer100g")}</caption>
      <tbody>
        {available.map((row) => (
          <tr key={row.key} className="border-b border-sand last:border-0">
            <th scope="row" className="py-3 pr-4 font-medium text-ink">
              {t(row.label)}
            </th>
            <td className="py-3 text-right tabular-nums text-ink-muted">
              {nutrition[row.key]} {row.unit}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
