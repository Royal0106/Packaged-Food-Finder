"use client";

import Link from "next/link";
import { useI18n } from "@/context/LocaleContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { useCheckout } from "@/hooks/useCheckout";
import { LanguageSelector } from "./LanguageSelector";

export function Header() {
  const { t } = useI18n();
  const { subscription, loading } = useSubscription();
  const { startCheckout, loading: checkoutLoading } = useCheckout();
  const hasAccess = subscription?.hasAccess ?? false;

  return (
    <header className="sticky top-0 z-20 border-b border-sand/80 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-forest text-cream shadow-sm">
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 3c-2.8 0-5 2-5 4.6 0 1.7.9 3.1 2.2 4L8 19.2c-.1.6.3 1.2.9 1.3h6.2c.6-.1 1-.7.9-1.3L14.8 11.6c1.3-.9 2.2-2.3 2.2-4C17 5 14.8 3 12 3Zm0 2c1.7 0 3 1.1 3 2.6S13.7 10.2 12 10.2 9 9.1 9 7.6 10.3 5 12 5Z"
              />
            </svg>
          </span>
          <span className="font-display text-xl tracking-tight text-ink group-hover:text-forest">
            {t("appName")}
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSelector />
          {loading ? (
            <span className="hidden h-9 w-28 animate-pulse rounded-full bg-sand sm:inline-block" />
          ) : hasAccess ? (
            <span className="rounded-full bg-forest/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-forest">
              {t("premiumActive")}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => void startCheckout()}
              disabled={checkoutLoading}
              className="inline-flex rounded-full bg-terracotta px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-terracotta-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta disabled:opacity-60"
            >
              {checkoutLoading ? t("loading") : t("subscribeMonthly")}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
