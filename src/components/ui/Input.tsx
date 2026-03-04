import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {label && (
        <label style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--text-mid)",
        }}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={className}
        style={{
          width: "100%",
          padding: "12px 16px",
          background: "var(--white)",
          border: `1px solid ${error ? "var(--error)" : "var(--sand)"}`,
          borderRadius: "4px",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "14px",
          fontWeight: 300,
          color: "var(--text-dark)",
          outline: "none",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "var(--forest-mid)";
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? "var(--error)" : "var(--sand)";
          props.onBlur?.(e);
        }}
        {...props}
      />
      {error && (
        <span style={{ fontSize: "12px", color: "var(--error)", fontWeight: 400 }}>
          {error}
        </span>
      )}
    </div>
  )
);
Input.displayName = "Input";