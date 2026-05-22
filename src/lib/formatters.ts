const LOCALE = "id-ID" as const;

export function formatRupiah(rupiah: number): string {
  return "Rp " + rupiah.toLocaleString(LOCALE);
}

export function formatDollar(dollars: number): string {
  return "$" + dollars.toFixed(2);
}

/** $1 = Rp 10,000 — converts raw rupiah to dollar display. */
export function formatRupiahAsDollar(rupiah: number): string {
  return "$" + (rupiah / 10000).toLocaleString(LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// No currency symbol - use when the symbol is supplied by surrounding JSX.
export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString(LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Weight is stored as integer kg, not grams. Display as "N kg". */
export function formatWeight(kg: number): string {
  return (
    kg.toLocaleString(LOCALE, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    }) + " kg"
  );
}

export function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleString(LOCALE, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatNumber(n: number): string {
  return n.toLocaleString(LOCALE);
}
