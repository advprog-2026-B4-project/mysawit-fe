import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="font-sans text-[11px] font-medium tracking-[0.12em] uppercase text-text-mid">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full px-4 py-3 bg-white rounded font-sans text-sm font-light text-text-dark outline-none border transition-colors duration-200 focus:border-forest-mid ${
          error ? "border-error" : "border-sand"
        } ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-error font-normal">{error}</span>
      )}
    </div>
  )
);
Input.displayName = "Input";