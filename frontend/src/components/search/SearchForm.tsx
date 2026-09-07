"use client";

import type { FormEvent } from "react";
import { useI18n } from "@/context/LocaleContext";
import { Button } from "@/components/ui/Button";

interface SearchFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (query: string) => void;
  loading: boolean;
}

export function SearchForm({ value, onChange, onSubmit, loading }: SearchFormProps) {
  const { t } = useI18n();
  const trimmed = value.trim();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!trimmed || loading) {
      return;
    }
    onSubmit(trimmed);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-3 sm:flex-row"
      role="search"
    >
      <label className="sr-only" htmlFor="product-search">
        {t("searchProducts")}
      </label>
      <input
        id="product-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t("searchPlaceholder")}
        autoComplete="off"
        className="h-14 w-full rounded-full border border-sand-dark bg-white px-6 text-base text-ink shadow-sm placeholder:text-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
      />
      <Button
        type="submit"
        disabled={!trimmed || loading}
        className="h-14 min-w-36 px-8"
      >
        {loading ? t("loading") : t("search")}
      </Button>
    </form>
  );
}
