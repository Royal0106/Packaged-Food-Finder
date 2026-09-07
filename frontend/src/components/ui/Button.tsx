import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-forest text-cream hover:bg-forest-dark disabled:bg-forest/40 focus-visible:outline-forest",
  secondary:
    "bg-white text-ink border border-sand-dark hover:border-forest hover:text-forest focus-visible:outline-forest",
  ghost:
    "bg-transparent text-forest hover:bg-cream-dark focus-visible:outline-forest",
};

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
