"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/context/LocaleContext";
import { useNotification } from "@/context/NotificationContext";
import { ApiError, getSearchHistory, isServerError, searchProducts } from "@/lib/api";
import type { Product, SearchHistoryItem } from "@/types/product";
import { ProductGrid } from "./ProductGrid";
import { RecentSearches } from "./RecentSearches";
import { SearchForm } from "./SearchForm";

export function SearchPage() {
  const { t, locale } = useI18n();
  const { showError } = useNotification();
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inFlightQuery = useRef<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      setHistory(await getSearchHistory());
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (hasSearched && activeQuery) {
      void runSearch(activeQuery);
    }
    // Re-run the last successful query when the user switches language.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only locale should retrigger
  }, [locale]);

  const runSearch = useCallback(
    async (nextQuery: string) => {
      const trimmed = nextQuery.trim();
      if (!trimmed) {
        return;
      }

      const requestKey = `${locale}:${trimmed.toLowerCase()}`;
      if (inFlightQuery.current === requestKey) {
        return;
      }

      inFlightQuery.current = requestKey;
      setQuery(trimmed);
      setActiveQuery(trimmed);
      setHasSearched(true);
      setLoading(true);
      setError(false);

      try {
        const result = await searchProducts(trimmed, locale);
        setProducts(result.products);
        void loadHistory();
      } catch (err) {
        setProducts([]);
        const isInvalidQuery = err instanceof ApiError && err.code === "INVALID_QUERY";
        setError(!isInvalidQuery);
        if (isServerError(err) || !isInvalidQuery) {
          showError(t("notificationTitle"), t("loadError"));
        }
      } finally {
        if (inFlightQuery.current === requestKey) {
          inFlightQuery.current = null;
        }
        setLoading(false);
      }
    },
    [locale, loadHistory, showError, t],
  );

  return (
    <div>
      <section className="border-b border-sand bg-[radial-gradient(circle_at_top_right,_#f3e3c8,_transparent_36%),linear-gradient(180deg,_#fbf7f0,_#f6f1e8)]">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-terracotta">
            {t("searchProducts")}
          </p>
          <h1 className="max-w-3xl font-display text-4xl leading-tight text-ink sm:text-5xl">
            {t("tagline")}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-muted">{t("heroSubtitle")}</p>
          <div className="mt-8 max-w-3xl">
            <SearchForm
              value={query}
              onChange={setQuery}
              onSubmit={(value) => void runSearch(value)}
              loading={loading}
            />
            <RecentSearches
              items={history}
              disabled={loading}
              onSelect={(value) => void runSearch(value)}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        {hasSearched ? (
          <>
            <h2 className="mb-6 font-display text-2xl text-ink">
              {loading ? t("searchResults") : t("resultsFor", { query: activeQuery })}
            </h2>
            {error ? (
              <EmptyMessage>{t("loadError")}</EmptyMessage>
            ) : !loading && products.length === 0 ? (
              <EmptyMessage>{t("noProductsFound", { query: activeQuery })}</EmptyMessage>
            ) : (
              <ProductGrid products={products} loading={loading} />
            )}
          </>
        ) : null}
      </section>
    </div>
  );
}

function EmptyMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-sand-dark bg-white px-6 py-12 text-center text-ink-muted">
      {children}
    </div>
  );
}
