import { type ButtonHTMLAttributes, type ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
  children: ReactNode;
}

const styles: Record<string, React.CSSProperties> = {
  primary: {
    background: "var(--forest)",
    color: "var(--cream)",
    border: "1px solid var(--forest)",
  },
  secondary: {
    background: "transparent",
    color: "var(--forest)",
    border: "1px solid var(--forest)",
  },
  ghost: {
    background: "transparent",
    color: "var(--text-mid)",
    border: "1px solid var(--sand)",
  },
  danger: {
    background: "transparent",
    color: "var(--error)",
    border: "1px solid var(--error)",
  },
};

export function Button({
  variant = "primary",
  loading = false,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      style={{
        ...styles[variant],
        padding: "11px 24px",
        borderRadius: "4px",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "13px",
        fontWeight: 400,
        letterSpacing: "0.06em",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.6 : 1,
        transition: "all 0.2s",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        whiteSpace: "nowrap",
        ...style,
      }}
      {...props}
    >
      {loading ? "Memproses..." : children}
    </button>
  );
}