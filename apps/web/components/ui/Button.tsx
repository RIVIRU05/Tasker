import { type ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "subtle" | "floating" | "large" | "on-dark";
type Size = "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary-600 text-on-dark hover:bg-primary-700 active:bg-primary-700",
  secondary: "bg-canvas text-ink border border-ink/10 hover:bg-canvas-soft active:bg-surface-pressed",
  subtle: "bg-canvas-soft text-ink hover:bg-surface-pressed",
  floating: "bg-canvas text-ink shadow-level3 hover:bg-canvas-soft",
  large: "bg-primary-600 text-on-dark rounded-xl hover:bg-primary-700",
  "on-dark": "bg-canvas text-ink hover:bg-canvas-soft",
};

const sizeClasses: Record<Size, string> = {
  md: "px-lg py-md text-body-md-strong",
  lg: "px-xl py-lg text-body-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className = "", href, children, ...props },
  ref
) {
  const shape = variant === "large" ? "rounded-xl" : "rounded-pill";
  const classes = `inline-flex items-center justify-center gap-sm font-text font-medium transition-colors whitespace-nowrap disabled:opacity-40 disabled:pointer-events-none ${shape} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button ref={ref} className={classes} {...props}>
      {children}
    </button>
  );
});
