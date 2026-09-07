"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/context/LocaleContext";
import { useNotification } from "@/context/NotificationContext";
import { getProduct, getProductNutrition, isServerError } from "@/lib/api";
import type { Nutrition, Product } from "@/types/product";
import { ProductImage } from "@/components/search/ProductImage";
import { NutritionCard } from "./NutritionCard";

export function ProductDetail({ code }: { code: string }) {
  const { t, locale } = useI18n();
  const { showError } = useNotification();
  const [product, setProduct] = useState<Product | null>(null);
  const [nutrition, setNutrition] = useState<Nutrition | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingNutrition, setLoadingNutrition] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadingProduct(true);
      setLoadingNutrition(true);
      setError(false);

      try {
        const nextProduct = await getProduct(code, locale);
        if (!cancelled) {
          setProduct(nextProduct);
        }
      } catch (error) {
        if (!cancelled) {
          setProduct(null);
          setError(true);
          if (isServerError(error)) {
            showError(t("notificationTitle"), t("loadError"));
          }
        }
      } finally {
        if (!cancelled) {
          setLoadingProduct(false);
        }
      }

      try {
        const access = await getProductNutrition(code, locale);
        if (!cancelled) {
          setHasAccess(access.hasAccess);
          setNutrition(access.nutrition);
        }
      } catch {
        if (!cancelled) {
          setHasAccess(false);
          setNutrition(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingNutrition(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [code, locale, showError, t]);

  if (loadingProduct) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="aspect-square animate-pulse rounded-3xl bg-sand" />
          <div className="space-y-4">
            <div className="h-10 w-2/3 animate-pulse rounded bg-sand" />
            <div className="h-5 w-1/3 animate-pulse rounded bg-sand" />
            <div className="h-24 animate-pulse rounded-3xl bg-sand" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-ink-muted">{t("loadError")}</p>
        <Link href="/" className="mt-4 inline-flex text-forest underline-offset-4 hover:underline">
          {t("backToResults")}
        </Link>
      </div>
    );
  }

  const name = product.name || t("unknownProduct");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        href="/"
        className="mb-6 inline-flex items-center text-sm font-medium text-forest underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
      >
        ← {t("backToResults")}
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <ProductImage
          src={product.imageUrl}
          alt={t("productImageAlt", { name })}
          className="min-h-80 rounded-3xl border border-sand bg-white aspect-square"
        />

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-terracotta">
            {t("productDetails")}
          </p>
          <h1 className="mt-2 font-display text-4xl text-ink">{name}</h1>
          <dl className="mt-6 space-y-4">
            <DetailRow label={t("brand")} value={product.brand ?? t("notAvailable")} />
            <DetailRow label={t("quantity")} value={product.quantity ?? t("notAvailable")} />
            <DetailRow
              label={t("categories")}
              value={
                product.categories && product.categories.length > 0
                  ? product.categories.join(", ")
                  : t("notAvailable")
              }
            />
          </dl>
          <div className="mt-6">
            <h2 className="font-display text-xl text-ink">{t("ingredients")}</h2>
            <p className="mt-2 leading-relaxed text-ink-muted">
              {product.ingredients ?? t("notAvailable")}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <NutritionCard
          loading={loadingNutrition}
          hasAccess={hasAccess}
          nutrition={nutrition}
        />
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className="mt-1 text-ink">{value}</dd>
    </div>
  );
}
