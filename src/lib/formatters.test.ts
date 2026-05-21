// @vitest-environment node

import { describe, expect, it } from "vitest";
import {
  formatRupiah,
  formatDollar,
  formatCents,
  formatWeight,
  formatDate,
  formatNumber,
} from "./formatters";

describe("formatRupiah", () => {
  it("formats zero", () => {
    expect(formatRupiah(0)).toBe("Rp 0");
  });

  it("formats thousands", () => {
    expect(formatRupiah(1000)).toBe("Rp 1.000");
  });

  it("formats millions", () => {
    expect(formatRupiah(1000000)).toBe("Rp 1.000.000");
  });

  it("formats large number", () => {
    expect(formatRupiah(12500000)).toBe("Rp 12.500.000");
  });
});

describe("formatDollar", () => {
  it("formats zero with two decimal places", () => {
    expect(formatDollar(0)).toBe("$0.00");
  });

  it("formats integer as two decimal places", () => {
    expect(formatDollar(10)).toBe("$10.00");
  });

  it("formats fractional value", () => {
    expect(formatDollar(1.5)).toBe("$1.50");
  });

  it("formats three-digit cents", () => {
    expect(formatDollar(0.125)).toBe("$0.13");
  });
});

describe("formatCents", () => {
  it("formats zero cents", () => {
    expect(formatCents(0)).toBe("0,00");
  });

  it("formats 100 cents as 1.00", () => {
    expect(formatCents(100)).toBe("1,00");
  });

  it("formats 150 cents as 1.50", () => {
    expect(formatCents(150)).toBe("1,50");
  });

  it("formats 5000 cents as 50.00", () => {
    expect(formatCents(5000)).toBe("50,00");
  });
});

describe("formatWeight", () => {
  it("formats zero grams", () => {
    expect(formatWeight(0)).toBe("0 kg");
  });

  it("formats 1000 grams as 1 kg", () => {
    expect(formatWeight(1000)).toBe("1 kg");
  });

  it("formats 1500 grams as 1,5 kg", () => {
    expect(formatWeight(1500)).toBe("1,5 kg");
  });

  it("formats 250 grams with three decimal places", () => {
    expect(formatWeight(250)).toBe("0,25 kg");
  });

  it("formats 50000 grams as 50 kg", () => {
    expect(formatWeight(50000)).toBe("50 kg");
  });
});

describe("formatDate", () => {
  it("returns dash for null input", () => {
    expect(formatDate(null)).toBe("-");
  });

  it("returns dash for undefined input", () => {
    expect(formatDate(undefined)).toBe("-");
  });

  it("formats a valid ISO date string", () => {
    const result = formatDate("2026-05-21T10:30:00.000Z");
    // Locale-dependent, verify it contains expected parts
    expect(result).toContain("2026");
    expect(result).toContain("Mei");
    expect(result).not.toBe("-");
  });
});

describe("formatNumber", () => {
  it("formats zero", () => {
    expect(formatNumber(0)).toBe("0");
  });

  it("formats thousands", () => {
    expect(formatNumber(1000)).toBe("1.000");
  });

  it("formats millions", () => {
    expect(formatNumber(1000000)).toBe("1.000.000");
  });

  it("formats large number", () => {
    expect(formatNumber(9999999)).toBe("9.999.999");
  });
});
