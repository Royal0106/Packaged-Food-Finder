"use client";

import { useI18n } from "@/context/LocaleContext";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="mt-16 border-t border-sand bg-white/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-ink-muted sm:px-6">
        <p className="font-display text-lg text-ink">{t("appName")}</p>
        <p>{t("footerNote")}</p>
      </div>
    </footer>
  );
}
