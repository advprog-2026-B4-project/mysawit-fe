// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { extractApiErrorMessage } from "./client";

describe("extractApiErrorMessage", () => {
  it("returns detailed field validation message when wrapper message is generic", () => {
    const payload = {
      success: false,
      message: "Validation failed",
      data: {
        fieldErrors: {
          coordinates: "Koordinat kebun overlap dengan kebun lain: KB-01",
        },
      },
    };

    expect(extractApiErrorMessage(payload)).toBe("Koordinat kebun overlap dengan kebun lain: KB-01");
  });

  it("returns explicit backend message for domain errors", () => {
    const payload = {
      success: false,
      message: "Koordinat harus membentuk 4 sudut persegi",
    };

    expect(extractApiErrorMessage(payload)).toBe("Koordinat harus membentuk 4 sudut persegi");
  });

  it("returns first field error if message is missing", () => {
    const payload = {
      success: false,
      data: {
        fieldErrors: {
          nama: "Nama is required",
          kode: "Kode is required",
        },
      },
    };

    expect(extractApiErrorMessage(payload)).toBe("Nama is required");
  });

  it("handles string payload directly", () => {
    expect(extractApiErrorMessage("Koordinat tidak valid")).toBe("Koordinat tidak valid");
  });
});
