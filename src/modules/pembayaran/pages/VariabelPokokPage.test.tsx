
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

// Controlled mocks for the hooks
const mockUseVariabelPokokList = vi.fn();
const mockUseUpdateVariabelPokok = vi.fn();
vi.mock("@/modules/pembayaran/hooks/useVariabelPokok", () => ({
  useVariabelPokokList: () => mockUseVariabelPokokList(),
  useUpdateVariabelPokok: () => mockUseUpdateVariabelPokok(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("VariabelPokokPage", () => {
  it("always renders the page heading", () => {
    mockUseVariabelPokokList.mockReturnValue({ data: undefined, isLoading: true, isError: false, error: null });
    mockUseUpdateVariabelPokok.mockReturnValue({ mutate: vi.fn(), isPending: false, isError: false, error: null, reset: vi.fn() });
    render(<VariabelPokokPage />);
    expect(screen.getByRole("heading", { name: /variabel upah/i })).toBeInTheDocument();
    expect(screen.getByText(/nilai acuan perhitungan pembayaran buruh/i)).toBeInTheDocument();
  });

  it("shows loading indicator while fetching", () => {
    mockUseVariabelPokokList.mockReturnValue({ data: undefined, isLoading: true, isError: false, error: null });
    mockUseUpdateVariabelPokok.mockReturnValue({ mutate: vi.fn(), isPending: false, isError: false, error: null, reset: vi.fn() });
    render(<VariabelPokokPage />);
    // When loading, skeleton rows are shown via animate-pulse class
    // The editor form should not be visible
    expect(screen.queryByRole("button", { name: /ubah/i })).not.toBeInTheDocument();
  });

  it("shows error message when the request fails", () => {
    mockUseVariabelPokokList.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Network Error"),
    });
    mockUseUpdateVariabelPokok.mockReturnValue({ mutate: vi.fn(), isPending: false, isError: false, error: null, reset: vi.fn() });
    render(<VariabelPokokPage />);
    expect(screen.getByText(/network error/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /ubah/i })).not.toBeInTheDocument();
  });

  it("falls back to generic message for non-Error error objects", () => {
    mockUseVariabelPokokList.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: "some string error",
    });
    mockUseUpdateVariabelPokok.mockReturnValue({ mutate: vi.fn(), isPending: false, isError: false, error: null, reset: vi.fn() });
    render(<VariabelPokokPage />);
    expect(screen.getByText(/gagal memuat data/i)).toBeInTheDocument();
  });

  it("renders the data when available", () => {
    const items = [
      { key: "UPAH_BURUH", label: "Upah Buruh", description: "", value: 500 },
      { key: "UPAH_SUPIR", label: "Upah Supir", description: "", value: 300 },
      { key: "UPAH_MANDOR", label: "Upah Mandor", description: "", value: 200 },
    ];
    mockUseVariabelPokokList.mockReturnValue({ data: items, isLoading: false, isError: false, error: null });
    mockUseUpdateVariabelPokok.mockReturnValue({ mutate: vi.fn(), isPending: false, isError: false, error: null, reset: vi.fn() });
    render(<VariabelPokokPage />);
    expect(screen.getByText(/upah buruh/i)).toBeInTheDocument();
    expect(screen.getByText(/upah supir/i)).toBeInTheDocument();
    expect(screen.getByText(/upah mandor/i)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /ubah/i })).toHaveLength(3);
  });
});
