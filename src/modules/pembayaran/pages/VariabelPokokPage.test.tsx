// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import VariabelPokokPage from "./VariabelPokokPage";

// Bypass AdminGuard so tests only focus on page logic
vi.mock("@/components/guards/AdminGuard", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Stub the editor to keep tests simple
vi.mock("@/modules/pembayaran/components/VariabelPokokEditor", () => ({
  default: ({ items }: { items: unknown[] }) => (
    <div data-testid="editor">editor:{items.length} items</div>
  ),
}));

// Controlled mock for the list hook
const mockUseVariabelPokokList = vi.fn();
vi.mock("@/modules/pembayaran/hooks/useVariabelPokok", () => ({
  useVariabelPokokList: () => mockUseVariabelPokokList(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("VariabelPokokPage", () => {
  it("always renders the page heading", () => {
    mockUseVariabelPokokList.mockReturnValue({ data: undefined, isLoading: true, isError: false, error: null });
    render(<VariabelPokokPage />);
    expect(screen.getByRole("heading", { name: /variabel pokok/i })).toBeInTheDocument();
    expect(screen.getByText(/manajemen pembayaran/i)).toBeInTheDocument();
  });

  it("shows loading indicator while fetching", () => {
    mockUseVariabelPokokList.mockReturnValue({ data: undefined, isLoading: true, isError: false, error: null });
    render(<VariabelPokokPage />);
    expect(screen.getByText(/memuat data/i)).toBeInTheDocument();
    expect(screen.queryByTestId("editor")).not.toBeInTheDocument();
  });

  it("shows error message when the request fails", () => {
    mockUseVariabelPokokList.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Network Error"),
    });
    render(<VariabelPokokPage />);
    expect(screen.getByText(/gagal memuat variabel pokok/i)).toBeInTheDocument();
    expect(screen.getByText(/network error/i)).toBeInTheDocument();
    expect(screen.queryByTestId("editor")).not.toBeInTheDocument();
  });

  it("falls back to generic message for non-Error error objects", () => {
    mockUseVariabelPokokList.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: "some string error",
    });
    render(<VariabelPokokPage />);
    expect(screen.getByText(/terjadi kesalahan/i)).toBeInTheDocument();
  });

  it("renders the editor when data is available", () => {
    const items = [
      { key: "UPAH_BURUH", label: "Upah Buruh", description: "", value: 500 },
      { key: "UPAH_SUPIR", label: "Upah Supir", description: "", value: 300 },
      { key: "UPAH_MANDOR", label: "Upah Mandor", description: "", value: 200 },
    ];
    mockUseVariabelPokokList.mockReturnValue({ data: items, isLoading: false, isError: false, error: null });
    render(<VariabelPokokPage />);
    expect(screen.getByTestId("editor")).toBeInTheDocument();
    expect(screen.getByText(/editor:3 items/i)).toBeInTheDocument();
    expect(screen.queryByText(/memuat data/i)).not.toBeInTheDocument();
  });
});
