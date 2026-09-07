"use client";

import Link from "next/link";
import { useI18n } from "@/context/LocaleContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { Button } from "@/components/ui/Button";

interface StatusPanelProps {
  variant: "success" | "cancel";
}

export function StatusPanel({ variant }: StatusPanelProps) {
  const { t } = useI18n();
  const { subscription, loading, refresh } = useSubscription();
  const hasAccess = subscription?.hasAccess ?? false;

  if (variant === "cancel") {
    return (
      <section className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-sand bg-white p-8 text-center shadow-sm">
          <h1 className="font-display text-3xl text-ink">{t("subscriptionCancelTitle")}</h1>
          <p className="mt-3 text-ink-muted">{t("subscriptionCancelBody")}</p>
          <div className="mt-8 flex justify-center">
            <Link href="/">
              <Button>{t("goHome")}</Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
      <div className="rounded-3xl border border-sand bg-white p-8 text-center shadow-sm">
        {loading ? (
          <>
            <div className="mx-auto h-8 w-48 animate-pulse rounded bg-sand" />
            <div className="mx-auto mt-4 h-16 w-full animate-pulse rounded bg-sand" />
          </>
        ) : hasAccess ? (
          <>
            <p className="text-sm font-semibold uppercase tracking-wide text-forest">
              {t("premiumActive")}
            </p>
            <h1 className="mt-2 font-display text-3xl text-ink">
              {t("subscriptionSuccessTitle")}
            </h1>
            <p className="mt-3 text-ink-muted">{t("subscriptionSuccessBody")}</p>
          </>
        ) : (
          <>
            <h1 className="font-display text-3xl text-ink">{t("subscriptionPendingTitle")}</h1>
            <p className="mt-3 text-ink-muted">{t("subscriptionPendingBody")}</p>
          </>
        )}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button variant="secondary" onClick={() => void refresh()} disabled={loading}>
            {t("refreshStatus")}
          </Button>
          <Link href="/">
            <Button>{t("goHome")}</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
