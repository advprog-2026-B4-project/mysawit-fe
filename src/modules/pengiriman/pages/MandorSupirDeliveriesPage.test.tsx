// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MandorSupirDeliveriesPage from "./MandorSupirDeliveriesPage";

const mockGetToken = vi.fn();
const mockGetRole = vi.fn();
const mockUseMandorSupirList = vi.fn();
const mockUseMandorSupirDeliveries = vi.fn();

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ supirId: "supir-1" }),
}));

vi.mock("@/lib/api/tokenStorage", () => ({
  getToken: () => mockGetToken(),
  getRole: () => mockGetRole(),
}));

vi.mock("../hooks/usePengiriman", () => ({
  useMandorSupirList: (...args: unknown[]) => mockUseMandorSupirList(...args),
  useMandorSupirDeliveries: (...args: unknown[]) => mockUseMandorSupirDeliveries(...args),
}));

function createQueryState(overrides?: Record<string, unknown>) {
  return {
    data: [],
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  mockGetToken.mockReturnValue("token");
  mockGetRole.mockReturnValue("MANDOR");
  mockUseMandorSupirList.mockReturnValue(createQueryState({
    data: [
      {
        supirId: "supir-1",
        username: "ega",
        name: "Ega Jawa",
        email: "ega@example.com",
      },
    ],
  }));
  mockUseMandorSupirDeliveries.mockReturnValue(createQueryState({
    data: [
      {
        pengirimanId: "pengiriman-1",
        supirId: "supir-1",
        mandorId: "mandor-1",
        status: "APPROVED_MANDOR",
        totalWeight: 180000,
        acceptedWeight: 0,
        statusReason: "Sudah diverifikasi",
        timestamp: "2026-04-12T12:00:00",
      },
    ],
  }));
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("MandorSupirDeliveriesPage", () => {
  it("renders supir profile header and delivery history", () => {
    render(<MandorSupirDeliveriesPage />);

    expect(screen.getByRole("heading", { name: /ega jawa/i })).toBeInTheDocument();
    expect(screen.getByText("Sudah diverifikasi")).toBeInTheDocument();
    expect(screen.getByText("180 kg")).toBeInTheDocument();
  });
});
