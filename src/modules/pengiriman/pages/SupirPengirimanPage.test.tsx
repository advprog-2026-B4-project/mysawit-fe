// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SupirPengirimanPage from "./SupirPengirimanPage";

const mockGetToken = vi.fn();
const mockGetRole = vi.fn();
const mockUseSupirDeliveries = vi.fn();
const mockUseUpdateDeliveryStatus = vi.fn();
const mockMutateAsync = vi.fn();

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock("@/lib/api/tokenStorage", () => ({
  getToken: () => mockGetToken(),
  getRole: () => mockGetRole(),
}));

vi.mock("../hooks/usePengiriman", () => ({
  useSupirDeliveries: (...args: unknown[]) => mockUseSupirDeliveries(...args),
  useUpdateDeliveryStatus: () => mockUseUpdateDeliveryStatus(),
}));

function createQueryState(overrides?: Record<string, unknown>) {
  return {
    data: [
      {
        pengirimanId: "pengiriman-1",
        supirId: "supir-1",
        mandorId: "mandor-1",
        status: "ASSIGNED",
        totalWeight: 120000,
        acceptedWeight: 0,
        statusReason: "Siap diangkut",
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
  mockUseUpdateDeliveryStatus.mockReturnValue({
    isPending: false,
    mutateAsync: mockMutateAsync,
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("SupirPengirimanPage", () => {
  it("renders the assigned delivery list for the supir", () => {
    mockUseSupirDeliveries.mockReturnValue(createQueryState({
      data: [
        {
          pengirimanId: "pengiriman-1",
          supirId: "supir-1",
          mandorId: "mandor-1",
          status: "ASSIGNED",
          totalWeight: 120000,
          acceptedWeight: 0,
          statusReason: "Siap diangkut",
          timestamp: "2026-02-25T08:30:00",
        },
        {
          pengirimanId: "pengiriman-2",
          supirId: "supir-1",
          mandorId: "mandor-1",
          status: "APPROVED_MANDOR",
          totalWeight: 80000,
          acceptedWeight: 0,
          statusReason: "Selesai",
          timestamp: "2026-02-25T09:30:00",
        },
      ],
    }));

    render(<SupirPengirimanPage />);

    expect(screen.getByRole("heading", { name: /pengiriman saya/i })).toBeInTheDocument();
    expect(screen.getByText(/lihat riwayat penugasan pengiriman/i)).toBeInTheDocument();
    expect(screen.getByText("pengiriman-1")).toBeInTheDocument();
    expect(screen.getByText("pengiriman-2")).toBeInTheDocument();
    expect(screen.getByText("ASSIGNED")).toBeInTheDocument();
    expect(screen.getByText("120 kg")).toBeInTheDocument();
    expect(screen.getByText("Siap diangkut")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /mulai kirim/i })).toBeInTheDocument();
    expect(mockUseSupirDeliveries).toHaveBeenCalledWith({
      startDate: undefined,
      endDate: undefined,
    }, {
      enabled: true,
    });
  });

  it("submits a status update for an assigned delivery", async () => {
    render(<SupirPengirimanPage />);

    fireEvent.click(screen.getByRole("button", { name: /mulai kirim/i }));

    expect(mockMutateAsync).toHaveBeenCalledWith({
      pengirimanId: "pengiriman-1",
      payload: { newStatus: "IN_TRANSIT" },
    });
  });

  it("submits a tiba status update for an in-transit delivery", () => {
    mockUseSupirDeliveries.mockReturnValue(createQueryState({
      data: [
        {
          pengirimanId: "pengiriman-2",
          supirId: "supir-1",
          mandorId: "mandor-1",
          status: "IN_TRANSIT",
          totalWeight: 120000,
          acceptedWeight: 0,
          statusReason: "Sedang menuju pabrik",
          timestamp: "2026-02-25T08:30:00",
        },
      ],
    }));

    render(<SupirPengirimanPage />);

    fireEvent.click(screen.getByRole("button", { name: /tandai tiba/i }));

    expect(mockMutateAsync).toHaveBeenCalledWith({
      pengirimanId: "pengiriman-2",
      payload: { newStatus: "TIBA" },
    });
  });

  it("passes date filters to the delivery query and resets them", () => {
    render(<SupirPengirimanPage />);

    fireEvent.change(screen.getByLabelText(/dari tanggal/i), {
      target: { value: "2026-02-01" },
    });
    fireEvent.change(screen.getByLabelText(/sampai tanggal/i), {
      target: { value: "2026-02-28" },
    });

    expect(mockUseSupirDeliveries).toHaveBeenLastCalledWith({
      startDate: "2026-02-01",
      endDate: "2026-02-28",
    }, {
      enabled: true,
    });

    fireEvent.click(screen.getByRole("button", { name: /reset filter/i }));

    expect(mockUseSupirDeliveries).toHaveBeenLastCalledWith({
      startDate: undefined,
      endDate: undefined,
    }, {
      enabled: true,
    });
  });

  it("shows the empty state when the supir has no delivery assignment", () => {
    mockUseSupirDeliveries.mockReturnValue(createQueryState({ data: [] }));

    render(<SupirPengirimanPage />);

    expect(screen.getByRole("heading", { name: /belum ada pengiriman/i })).toBeInTheDocument();
    expect(screen.getByText(/saat ini belum ada penugasan pengiriman/i)).toBeInTheDocument();
  });

  it("renders login, forbidden, loading, and error states", () => {
    mockGetToken.mockReturnValue("");
    const { rerender } = render(<SupirPengirimanPage />);
    expect(screen.getByRole("heading", { name: /daftar pengiriman supir/i })).toBeInTheDocument();

    mockGetToken.mockReturnValue("token");
    mockGetRole.mockReturnValue("MANDOR");
    rerender(<SupirPengirimanPage />);
    expect(screen.getByRole("heading", { name: /akses terbatas/i })).toBeInTheDocument();

    mockGetRole.mockReturnValue("SUPIR");
    mockUseSupirDeliveries.mockReturnValue(createQueryState({ isLoading: true }));
    rerender(<SupirPengirimanPage />);
    expect(screen.getByText(/memuat daftar pengiriman/i)).toBeInTheDocument();

    const refetch = vi.fn();
    mockUseSupirDeliveries.mockReturnValue(createQueryState({
      isError: true,
      error: undefined,
      refetch,
    }));
    rerender(<SupirPengirimanPage />);
    expect(screen.getByText(/gagal memuat daftar pengiriman/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /coba lagi/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it("renders completed delivery without actions and without status reason", () => {
    mockUseSupirDeliveries.mockReturnValue(createQueryState({
      data: [
        {
          pengirimanId: "pengiriman-3",
          supirId: "supir-1",
          mandorId: "mandor-1",
          status: "APPROVED_ADMIN",
          totalWeight: 120000,
          acceptedWeight: 120000,
          statusReason: null,
          timestamp: "2026-02-25T08:30:00",
        },
      ],
    }));

    render(<SupirPengirimanPage />);

    expect(screen.getByText(/tidak ada catatan/i)).toBeInTheDocument();
    expect(screen.getByText(/tidak ada aksi/i)).toBeInTheDocument();
  });
});
