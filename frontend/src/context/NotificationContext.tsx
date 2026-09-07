"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export interface AppNotification {
  id: number;
  title: string;
  message: string;
}

interface NotificationContextValue {
  notification: AppNotification | null;
  showError: (title: string, message: string) => void;
  dismiss: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined,
);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notification, setNotification] = useState<AppNotification | null>(null);

  const dismiss = useCallback(() => {
    setNotification(null);
  }, []);

  const showError = useCallback((title: string, message: string) => {
    setNotification({
      id: Date.now(),
      title,
      message,
    });
  }, []);

  const value = useMemo(
    () => ({ notification, showError, dismiss }),
    [notification, showError, dismiss],
  );

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
}
