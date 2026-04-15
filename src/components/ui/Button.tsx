import { type ButtonHTMLAttributes, type ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<string, string> = {
  primary:   "bg-forest text-cream border border-forest hover:bg-forest-mid active:bg-forest-light",
  secondary: "bg-transparent text-forest border border-forest hover:bg-forest/10 active:bg-forest/20",
  ghost:     "bg-transparent text-text-mid border border-sand hover:bg-cream-dark active:bg-cream",
  danger:    "bg-transparent text-error border border-error hover:bg-error/10 active:bg-error/20",
};

export function Button({
  variant = "primary",
  loading = false,
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`${variantClasses[variant]} px-6 py-2.5 rounded font-sans text-[13px] font-normal tracking-[0.06em] transition-all duration-200 inline-flex items-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/45 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {loading ? "Memproses..." : children}
    </button>
  );
}