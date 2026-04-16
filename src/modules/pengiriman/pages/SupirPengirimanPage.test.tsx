// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SupirPengirimanPage from "./SupirPengirimanPage";

const mockGetToken = vi.fn();
const mockGetRole = vi.fn();
const mockUseSupirDeliveries = vi.fn();

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock("@/lib/api/tokenStorage", () => ({
  getToken: () => mockGetToken(),
  getRole: () => mockGetRole(),
}));

vi.mock("../hooks/usePengiriman", () => ({
  useSupirDeliveries: (...args: unknown[]) => mockUseSupirDeliveries(...args),
}));

function createQueryState(overrides?: Record<string, unknown>) {
  return {
    data: [
      {
        pengirimanId: "pengiriman-1",
        supirId: "supir-1",
        mandorId: "mandor-1",
        status: "ASSIGNED",
        totalWeight: 120,
        acceptedWeight: 0,
        timestamp: "2026-02-25T08:30:00",
      },
    ],
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  mockGetToken.mockReturnValue("token");
  mockGetRole.mockReturnValue("SUPIR");
  mockUseSupirDeliveries.mockReturnValue(createQueryState());
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("SupirPengirimanPage", () => {
  it("renders the assigned delivery list for the supir", () => {
    render(<SupirPengirimanPage />);

    expect(screen.getByRole("heading", { name: /pengiriman saya/i })).toBeInTheDocument();
    expect(screen.getByText(/daftar pengiriman yang sedang atau sudah ditugaskan/i)).toBeInTheDocument();
    expect(screen.getByText("pengiriman-1")).toBeInTheDocument();
    expect(screen.getByText("ASSIGNED")).toBeInTheDocument();
    expect(screen.getByText("120 kg")).toBeInTheDocument();
    expect(mockUseSupirDeliveries).toHaveBeenCalledWith(undefined, {
      enabled: true,
    });
  });

  it("shows the empty state when the supir has no delivery assignment", () => {
    mockUseSupirDeliveries.mockReturnValue(createQueryState({ data: [] }));

    render(<SupirPengirimanPage />);

    expect(screen.getByRole("heading", { name: /belum ada pengiriman/i })).toBeInTheDocument();
    expect(screen.getByText(/saat ini belum ada penugasan pengiriman/i)).toBeInTheDocument();
  });
});
