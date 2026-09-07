"use client";

import Link from "next/link";
import { useI18n } from "@/context/LocaleContext";
import type { Product } from "@/types/product";
import { ProductImage } from "./ProductImage";

export function ProductCard({ product }: { product: Product }) {
  const { t } = useI18n();
  const name = product.name || t("unknownProduct");

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-sand bg-white shadow-[0_8px_30px_rgba(47,36,22,0.04)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(47,36,22,0.08)]">
      <ProductImage
        src={product.imageUrl}
        alt={t("productImageAlt", { name })}
        className="aspect-square"
      />
      <div className="flex flex-1 flex-col gap-2 px-5 pb-5 pt-4">
        <h3 className="font-display text-lg leading-snug text-ink">{name}</h3>
        <p className="text-sm text-ink-muted">{product.brand ?? t("unknownBrand")}</p>
        {product.quantity ? (
          <p className="text-sm text-forest">{product.quantity}</p>
        ) : null}
        <Link
          href={`/products/${encodeURIComponent(product.code)}`}
          className="mt-auto inline-flex items-center justify-center rounded-full bg-forest px-4 py-2 text-sm font-semibold text-cream transition hover:bg-forest-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
        >
          {t("viewProduct")}
        </Link>
      </div>
    </article>
  );
}
