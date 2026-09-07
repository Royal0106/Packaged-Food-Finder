"use client";

import { useState } from "react";

interface ProductImageProps {
  src: string | null;
  alt: string;
  className?: string;
}

export function ProductImage({ src, alt, className = "" }: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const showPlaceholder = !src || failed;

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-cream-dark ${className}`}
    >
      {showPlaceholder ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-ink-muted">
          <svg viewBox="0 0 48 48" className="h-12 w-12 opacity-50" aria-hidden="true">
            <rect
              x="10"
              y="8"
              width="28"
              height="32"
              rx="4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path d="M16 18h16M16 24h10" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
      ) : (
        // External Open Food Facts hosts vary; a regular img avoids next/image domain config issues.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-contain p-3"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
