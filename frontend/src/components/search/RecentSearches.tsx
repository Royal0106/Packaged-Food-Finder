"use client";

import { useI18n } from "@/context/LocaleContext";
import type { SearchHistoryItem } from "@/types/product";

interface RecentSearchesProps {
  items: SearchHistoryItem[];
  onSelect: (query: string) => void;
  disabled?: boolean;
}

export function RecentSearches({ items, onSelect, disabled = false }: RecentSearchesProps) {
  const { t } = useI18n();

  if (items.length === 0) {
    return null;
  }

  return (
    <section aria-label={t("recentSearches")} className="mt-6">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
        {t("recentSearches")}
      </h2>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item.query)}
              disabled={disabled}
              className="rounded-full border border-sand-dark bg-white px-4 py-2 text-sm text-ink transition hover:border-forest hover:text-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:cursor-not-allowed disabled:opacity-60"
            >
              {item.query}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
