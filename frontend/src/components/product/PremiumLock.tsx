"use client";

import { useI18n } from "@/context/LocaleContext";
import { useCheckout } from "@/hooks/useCheckout";
import { Button } from "@/components/ui/Button";

export function PremiumLock() {
  const { t } = useI18n();
  const { startCheckout, loading, error } = useCheckout();

  return (
    <div className="overflow-hidden rounded-3xl border border-terracotta/20 bg-[linear-gradient(160deg,_#fff7ed,_#fffdf8_55%,_#f6f1e8)] p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-terracotta">
        {t("premiumTitle")}
      </p>
      <div className="mt-4 flex items-start gap-3">
        <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path
              fill="currentColor"
              d="M17 9h-1V7a4 4 0 1 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-7-2a2 2 0 1 1 4 0v2h-4V7Zm7 12H7v-8h10v8Z"
            />
          </svg>
        </span>
        <div>
          <h3 className="font-display text-2xl text-ink">{t("premiumLocked")}</h3>
          <p className="mt-2 max-w-xl text-ink-muted">{t("premiumDescription")}</p>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button onClick={() => void startCheckout()} disabled={loading}>
          {loading ? t("loading") : t("unlockNutrition")}
        </Button>
        {error ? <p className="text-sm text-terracotta">{t("checkoutError")}</p> : null}
      </div>
    </div>
  );
}
