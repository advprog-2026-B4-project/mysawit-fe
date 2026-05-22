
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/Button";
import {
  compactPengirimanId,
  deliveryStatusClass,
  formatTimestamp,
  formatWeight,
  gramsToKilogramsInput,
  kilogramsInputToGrams,
} from "./PengirimanShared";

describe("PengirimanShared", () => {
  it("formats weights, timestamps, and compact ids", () => {
    expect(formatWeight(120000)).toBe("120 kg");
    expect(formatWeight(120500)).toBe("120,5 kg");
    expect(formatTimestamp("2026-04-12T08:30:00")).toContain("2026");
    expect(compactPengirimanId("")).toBe("-");
    expect(compactPengirimanId("short-id")).toBe("short-id");
    expect(compactPengirimanId("12345678-1234-1234-1234-123456789012")).toBe("12345678...789012");
  });

  it("maps delivery status classes", () => {
    expect(deliveryStatusClass("REJECTED")).toContain("text-error");
    expect(deliveryStatusClass("REJECTED_ADMIN")).toContain("text-error");
    expect(deliveryStatusClass("APPROVED")).toContain("text-success");
    expect(deliveryStatusClass("APPROVED_ADMIN")).toContain("text-success");
    expect(deliveryStatusClass("PARTIAL")).toContain("text-gold");
    expect(deliveryStatusClass("ASSIGNED")).toContain("text-forest");
  });

  it("converts kilogram input to grams and back", () => {
    expect(kilogramsInputToGrams("")).toBeNull();
    expect(kilogramsInputToGrams("abc")).toBeNull();
    expect(kilogramsInputToGrams("-1")).toBeNull();
    expect(kilogramsInputToGrams("12,5")).toBe(12500);
    expect(kilogramsInputToGrams("12.345")).toBe(12345);
    expect(gramsToKilogramsInput(120000)).toBe("120");
    expect(gramsToKilogramsInput(120500)).toBe("120.5");
  });

  it("renders the shared loading button state used by pengiriman pages", () => {
    render(<Button loading>Submit</Button>);

    expect(screen.getByRole("button", { name: /memproses/i })).toBeDisabled();
  });
});
