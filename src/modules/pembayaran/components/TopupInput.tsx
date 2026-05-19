"use client";

import { formatRupiah, formatDollar, formatNumber } from "@/lib/formatters";

interface TopupInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export default function TopupInput({ value, onChange, error, disabled }: TopupInputProps) {
  const rawValue = value.replace(/\D/g, "");
  const rupiahAmount = parseInt(rawValue || "0", 10);
  const internalCents = rupiahAmount / 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    const num = parseInt(digits || "0", 10);
    // Format as locale string while typing
    const formatted = num === 0 ? "" : formatNumber(num);
    onChange(formatted);
  };

  return (
    <div>
      <input
        type="text"
        inputMode="numeric"
        placeholder="Contoh: 50.000"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={`w-full px-4 py-3 border rounded-md font-sans text-[14px] text-text-dark placeholder:text-text-light bg-white focus:outline-none focus:ring-1 ${
          error
            ? "border-error focus:ring-error"
            : "border-cream-dark focus:ring-forest focus:border-forest"
        }`}
      />
      {rawValue && (
        <p className={`mt-1 font-sans text-[12px] ${error ? "text-error" : "text-text-mid"}`}>
          = {formatRupiah(rupiahAmount)} ({formatDollar(internalCents / 100)})
        </p>
      )}
      {error && (
        <p className="mt-1 font-sans text-[12px] text-error">{error}</p>
      )}
      <p className="mt-1 font-sans text-[11px] text-text-light">
        Minimum Rp10.000 ($1 = Rp10.000)
      </p>
    </div>
  );
}
