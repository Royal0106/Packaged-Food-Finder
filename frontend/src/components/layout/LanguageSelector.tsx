"use client";

import { useI18n } from "@/context/LocaleContext";
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n";
import type { Locale } from "@/types/product";

export function LanguageSelector() {
  const { locale, setLocale, t } = useI18n();

  return (
    <label className="flex items-center gap-2 text-sm text-ink-muted">
      <span className="sr-only">{t("language")}</span>
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        className="rounded-full border border-sand-dark bg-white px-3 py-2 text-sm font-medium text-ink shadow-sm transition-colors hover:border-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
        aria-label={t("language")}
      >
        {LOCALES.map((code) => (
          <option key={code} value={code}>
            {LOCALE_LABELS[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
