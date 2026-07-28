import type { HTMLAttributes, ReactNode } from "react";

type Tone = "neutral" | "primary" | "accent" | "success" | "danger" | "outline";

interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  icon?: ReactNode;
}

const toneClasses: Record<Tone, string> = {
  neutral: "bg-canvas-soft text-ink",
  primary: "bg-primary-600 text-on-dark",
  accent: "bg-accent-100 text-accent-800",
  success: "bg-success/10 text-success",
  danger: "bg-danger/10 text-danger",
  outline: "border border-ink/15 text-ink bg-transparent",
};

export function Pill({ tone = "neutral", icon, className = "", children, ...props }: PillProps) {
  return (
    <span
      className={`inline-flex items-center gap-xs rounded-pill px-lg py-sm text-body-sm-strong ${toneClasses[tone]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </span>
  );
}
