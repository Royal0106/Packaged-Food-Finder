import type { Locale } from "@/types/product";
import de from "@/messages/de.json";
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";
import nl from "@/messages/nl.json";

export const LOCALES: Locale[] = ["en", "nl", "de", "fr"];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  nl: "Nederlands",
  de: "Deutsch",
  fr: "Français",
};

export const LOCALE_STORAGE_KEY = "foodlens-locale";

export type MessageKey = keyof typeof en;

const dictionaries: Record<Locale, Record<MessageKey, string>> = {
  en,
  nl,
  de,
  fr,
};

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "nl" || value === "de" || value === "fr";
}

export function translate(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string>,
) {
  const template = dictionaries[locale][key] ?? dictionaries.en[key] ?? key;
  if (!vars) {
    return template;
  }

  return Object.entries(vars).reduce(
    (result, [name, value]) => result.replaceAll(`{${name}}`, value),
    template,
  );
}

export function readStoredLocale(): Locale {
  if (typeof window === "undefined") {
    return "en";
  }

  const fromStorage = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (isLocale(fromStorage)) {
    return fromStorage;
  }

  const cookieMatch = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${LOCALE_STORAGE_KEY}=`));
  const fromCookie = cookieMatch?.split("=")[1];
  return isLocale(fromCookie) ? fromCookie : "en";
}

export function persistLocale(locale: Locale) {
  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  document.cookie = `${LOCALE_STORAGE_KEY}=${locale}; path=/; max-age=31536000; samesite=lax`;
}
