import type { HTMLAttributes } from "react";

type Variant = "content" | "elevated" | "soft" | "on-dark" | "accent-soft";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  content: "bg-canvas text-ink",
  elevated: "bg-canvas text-ink shadow-level1",
  soft: "bg-canvas-soft text-ink",
  "on-dark": "bg-primary-800 text-on-dark",
  "accent-soft": "bg-accent-50 text-ink",
};

export function Card({ variant = "content", className = "", children, ...props }: CardProps) {
  return (
    <div className={`rounded-xl p-2xl ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}
