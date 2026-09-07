"use client";

import { LocaleProvider } from "@/context/LocaleContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { NotificationToast } from "@/components/ui/NotificationToast";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <NotificationProvider>
        <SubscriptionProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <NotificationToast />
          </div>
        </SubscriptionProvider>
      </NotificationProvider>
    </LocaleProvider>
  );
}
