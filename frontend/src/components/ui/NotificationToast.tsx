"use client";

import { useEffect } from "react";
import { useI18n } from "@/context/LocaleContext";
import { useNotification } from "@/context/NotificationContext";

const AUTO_DISMISS_MS = 8_000;

export function NotificationToast() {
  const { t } = useI18n();
  const { notification, dismiss } = useNotification();

  useEffect(() => {
    if (!notification) {
      return;
    }

    const timer = window.setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [notification, dismiss]);

  if (!notification) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed right-4 top-20 z-50 w-[min(100%-2rem,24rem)] rounded-2xl border border-terracotta/20 bg-white p-4 shadow-[0_16px_40px_rgba(47,36,22,0.12)]"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 15a1.25 1.25 0 1 1 0-2.5A1.25 1.25 0 0 1 12 17Zm1-4.5h-2V7h2Z"
            />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">{notification.title}</p>
          <p className="mt-1 text-sm text-ink-muted">{notification.message}</p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-full p-1 text-ink-muted transition hover:bg-cream-dark hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
          aria-label={t("dismissNotification")}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path
              fill="currentColor"
              d="M18.3 5.7a1 1 0 0 0-1.4 0L12 10.6 7.1 5.7a1 1 0 0 0-1.4 1.4l4.9 4.9-4.9 4.9a1 1 0 1 0 1.4 1.4l4.9-4.9 4.9 4.9a1 1 0 0 0 1.4-1.4L13.4 12l4.9-4.9a1 1 0 0 0 0-1.4Z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
