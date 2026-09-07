"use client";

import { useI18n } from "@/context/LocaleContext";
import type { Nutrition } from "@/types/product";
import { NutritionTable } from "./NutritionTable";
import { PremiumLock } from "./PremiumLock";

interface NutritionCardProps {
  loading: boolean;
  hasAccess: boolean;
  nutrition: Nutrition | null;
}

export function NutritionCard({ loading, hasAccess, nutrition }: NutritionCardProps) {
  const { t } = useI18n();

  if (loading) {
    return (
      <section className="rounded-3xl border border-sand bg-white p-6 sm:p-8">
        <div className="mb-4 h-6 w-48 animate-pulse rounded bg-sand" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-8 animate-pulse rounded bg-sand" />
          ))}
        </div>
      </section>
    );
  }

  if (!hasAccess) {
    return <PremiumLock />;
  }

  return (
    <section className="rounded-3xl border border-sand bg-white p-6 sm:p-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl text-ink">{t("nutritionPer100g")}</h2>
        <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-forest">
          {t("premiumActive")}
        </span>
      </div>
      {nutrition ? <NutritionTable nutrition={nutrition} /> : <p>{t("notAvailable")}</p>}
    </section>
  );
}
