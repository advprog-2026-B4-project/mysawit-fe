import { type ButtonHTMLAttributes, type ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<string, string> = {
  primary:   "bg-forest text-cream border border-forest",
  secondary: "bg-transparent text-forest border border-forest",
  ghost:     "bg-transparent text-text-mid border border-sand",
  danger:    "bg-transparent text-error border border-error",
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
      className={`${variantClasses[variant]} px-6 py-[11px] rounded font-sans text-[13px] font-normal tracking-[0.06em] transition-all duration-200 inline-flex items-center gap-2 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {loading ? "Memproses..." : children}
    </button>
  );
}