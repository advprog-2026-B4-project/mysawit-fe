// @vitest-environment node

import { describe, expect, it } from "vitest";
import { extractErrorMessage } from "./toast";

describe("extractErrorMessage", () => {
  it("returns Error message", () => {
    expect(extractErrorMessage(new Error("Network error"))).toBe("Network error");
  });

  it("trims Error message whitespace", () => {
    expect(extractErrorMessage(new Error("  timeout  "))).toBe("timeout");
  });

  it("returns fallback for Error with empty message", () => {
    expect(extractErrorMessage(new Error(""))).toBe("Terjadi kesalahan. Silakan coba lagi.");
  });

  it("returns fallback for Error with whitespace-only message", () => {
    expect(extractErrorMessage(new Error("   "))).toBe("Terjadi kesalahan. Silakan coba lagi.");
  });

  it("returns string error directly", () => {
    expect(extractErrorMessage("Invalid input")).toBe("Invalid input");
  });

  it("trims string whitespace", () => {
    expect(extractErrorMessage("  Gagal.  ")).toBe("Gagal.");
  });

  it("returns fallback for empty string", () => {
    expect(extractErrorMessage("")).toBe("Terjadi kesalahan. Silakan coba lagi.");
  });

  it("returns fallback for null", () => {
    expect(extractErrorMessage(null)).toBe("Terjadi kesalahan. Silakan coba lagi.");
  });

  it("returns fallback for undefined", () => {
    expect(extractErrorMessage(undefined)).toBe("Terjadi kesalahan. Silakan coba lagi.");
  });

  it("returns fallback for plain object", () => {
    expect(extractErrorMessage({ code: 500 })).toBe("Terjadi kesalahan. Silakan coba lagi.");
  });

  it("uses custom fallback message", () => {
    expect(extractErrorMessage(null, "Custom fallback")).toBe("Custom fallback");
  });

  it("returns Error message even with custom fallback", () => {
    expect(extractErrorMessage(new Error("Real error"), "Custom fallback")).toBe("Real error");
  });
});
