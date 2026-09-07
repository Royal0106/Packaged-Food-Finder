"use client";

import { useState } from "react";
import { createCheckoutSession } from "@/lib/api";

export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function startCheckout() {
    if (loading) {
      return;
    }

    setLoading(true);
    setError(false);

    try {
      const { url } = await createCheckoutSession();
      window.location.assign(url);
    } catch {
      setError(true);
      setLoading(false);
    }
  }

  return { startCheckout, loading, error };
}
