// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminPengirimanPage from "./AdminPengirimanPage";

const mockGetToken = vi.fn();
const mockGetRole = vi.fn();
const mockUseApprovedDeliveriesForAdmin = vi.fn();
const mockUseAdminProcessDelivery = vi.fn();
const mockAdminMutateAsync = vi.fn();

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock("@/lib/api/tokenStorage", () => ({
  getToken: () => mockGetToken(),
  getRole: () => mockGetRole(),
}));

vi.mock("../hooks/usePengiriman", () => ({
  useApprovedDeliveriesForAdmin: (...args: unknown[]) => mockUseApprovedDeliveriesForAdmin(...args),
  useAdminProcessDelivery: () => mockUseAdminProcessDelivery(),
}));

function createQueryState(overrides?: Record<string, unknown>) {
  return {
    data: [
      {
        pengirimanId: "pengiriman-1",
        supirId: "supir-1",
        supirName: "Ega Jawa",
        mandorId: "mandor-1",
        mandorName: "Awan Mandor",
        status: "APPROVED_MANDOR",
        totalWeight: 200000,
        acceptedWeight: 0,
        panenIds: ["panen-1", "panen-2"],
        timestamp: "2026-04-13T11:00:00",
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
  mockGetRole.mockReturnValue("ADMIN");
  mockUseApprovedDeliveriesForAdmin.mockReturnValue(createQueryState());
  mockUseAdminProcessDelivery.mockReturnValue({
    isPending: false,
    mutateAsync: mockAdminMutateAsync,
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("AdminPengirimanPage", () => {
  it("renders approved delivery rows and admin actions", () => {
    render(<AdminPengirimanPage />);

    expect(screen.getByRole("heading", { name: /^pengiriman$/i })).toBeInTheDocument();
    expect(screen.getByText("Awan Mandor")).toBeInTheDocument();
    expect(screen.getByText(/supir: ega jawa/i)).toBeInTheDocument();
    expect(screen.getByText("200 kg")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /approve/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reject/i })).toBeInTheDocument();
  });

  it("submits filters by mandor name and date", () => {
    render(<AdminPengirimanPage />);

    fireEvent.change(screen.getByLabelText(/filter nama mandor/i), {
      target: { value: "Awan" },
    });
    fireEvent.change(screen.getByLabelText(/filter tanggal/i), {
      target: { value: "2026-04-13" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^cari$/i }));

    expect(mockUseApprovedDeliveriesForAdmin).toHaveBeenLastCalledWith({
      mandorName: "Awan",
      date: "2026-04-13",
    }, {
      enabled: true,
    });
  });

  it("submits a full approve payload", () => {
    render(<AdminPengirimanPage />);

    fireEvent.click(screen.getByRole("button", { name: /^approve$/i }));

    expect(mockAdminMutateAsync).toHaveBeenCalledWith({
      pengirimanId: "pengiriman-1",
      payload: {
        acceptedWeight: 200000,
        status: "APPROVED_ADMIN",
      },
    });
  });

  it("requires a reason before rejecting and submits the reject payload", () => {
    render(<AdminPengirimanPage />);

    fireEvent.click(screen.getByRole("button", { name: /reject/i }));
    fireEvent.click(screen.getByRole("button", { name: /konfirmasi/i }));

    expect(screen.getByText(/alasan penolakan admin wajib diisi/i)).toBeInTheDocument();
    expect(mockAdminMutateAsync).not.toHaveBeenCalled();

    fireEvent.change(screen.getByPlaceholderText(/tuliskan alasan penolakan/i), {
      target: { value: "Kualitas sawit tidak sesuai" },
    });
    fireEvent.click(screen.getByRole("button", { name: /konfirmasi/i }));

    expect(mockAdminMutateAsync).toHaveBeenCalledWith({
      pengirimanId: "pengiriman-1",
      payload: {
        acceptedWeight: 0,
        status: "REJECTED_ADMIN",
        reason: "Kualitas sawit tidak sesuai",
      },
    });
  });
});
