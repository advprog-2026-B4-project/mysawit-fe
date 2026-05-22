
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
        {
          pengirimanId: "pengiriman-2",
          supirId: "supir-1",
          mandorId: "mandor-1",
          status: "APPROVED_ADMIN",
          totalWeight: 90000,
          acceptedWeight: 90000,
          statusReason: "Selesai",
          timestamp: "2026-04-12T13:00:00",
        },
      ],
    }));

    render(<MandorSupirDeliveriesPage />);

    expect(screen.getByRole("heading", { name: /ega jawa/i })).toBeInTheDocument();
    expect(screen.getByText("ega@example.com - @ega")).toBeInTheDocument();
    expect(screen.getByText("Sudah diverifikasi")).toBeInTheDocument();
    expect(screen.getByText("Selesai")).toBeInTheDocument();
    expect(screen.getByText("180 kg")).toBeInTheDocument();
  });

  it("shows the login prompt when no session exists", () => {
    mockGetToken.mockReturnValue("");

    render(<MandorSupirDeliveriesPage />);

    expect(screen.getByRole("heading", { name: /profil supir/i })).toBeInTheDocument();
    expect(screen.getByText(/perlu login terlebih dahulu/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /masuk/i })).toHaveAttribute("href", "/login");
    expect(mockUseMandorSupirDeliveries).toHaveBeenCalledWith("supir-1", { enabled: false });
  });

  it("shows the forbidden state for non-mandor users", () => {
    mockGetRole.mockReturnValue("ADMIN");

    render(<MandorSupirDeliveriesPage />);

    expect(screen.getByRole("heading", { name: /akses terbatas/i })).toBeInTheDocument();
    expect(screen.getByText(/khusus untuk pengguna dengan role mandor/i)).toBeInTheDocument();
    expect(mockUseMandorSupirList).toHaveBeenCalledWith(undefined, { enabled: false });
  });

  it("falls back to the supir id when profile data is unavailable", () => {
    mockUseMandorSupirList.mockReturnValue(createQueryState({ data: undefined }));
    mockUseMandorSupirDeliveries.mockReturnValue(createQueryState({ data: undefined }));

    render(<MandorSupirDeliveriesPage />);

    expect(screen.getByRole("heading", { name: /profil supir/i })).toBeInTheDocument();
    expect(screen.getByText(/riwayat pengiriman untuk supir supir-1/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /belum ada pengiriman/i })).toBeInTheDocument();
  });

  it("shows the loading state", () => {
    mockUseMandorSupirDeliveries.mockReturnValue(createQueryState({ isLoading: true }));

    render(<MandorSupirDeliveriesPage />);

    expect(screen.getByText(/memuat riwayat pengiriman supir/i)).toBeInTheDocument();
  });

  it("shows an error message and refetches", () => {
    const refetch = vi.fn();
    mockUseMandorSupirDeliveries.mockReturnValue(createQueryState({
      isError: true,
      error: new Error("Riwayat gagal"),
      refetch,
    }));

    render(<MandorSupirDeliveriesPage />);

    expect(screen.getByText("Riwayat gagal")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /coba lagi/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it("uses the fallback error and no-note text", () => {
    mockUseMandorSupirDeliveries.mockReturnValueOnce(createQueryState({
      isError: true,
      error: "bad",
    }));

    const { rerender } = render(<MandorSupirDeliveriesPage />);
    expect(screen.getByText(/gagal memuat riwayat pengiriman supir/i)).toBeInTheDocument();

    mockUseMandorSupirDeliveries.mockReturnValue(createQueryState({
      data: [
        {
          pengirimanId: "pengiriman-2",
          supirId: "supir-1",
          mandorId: "mandor-1",
          status: "PARTIAL",
          totalWeight: 180000,
          acceptedWeight: 120000,
          statusReason: "",
          timestamp: "2026-04-12T12:00:00",
        },
      ],
    }));

    rerender(<MandorSupirDeliveriesPage />);

    expect(screen.getByText(/tidak ada catatan/i)).toBeInTheDocument();
    expect(screen.getByText("120 kg")).toBeInTheDocument();
  });
});
