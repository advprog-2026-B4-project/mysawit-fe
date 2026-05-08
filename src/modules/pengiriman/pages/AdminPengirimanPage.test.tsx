// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
    mockUseApprovedDeliveriesForAdmin.mockReturnValue(createQueryState({
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
        {
          pengirimanId: "pengiriman-2",
          supirId: "supir-2",
          supirName: "Bima Supir",
          mandorId: "mandor-2",
          mandorName: "Citra Mandor",
          status: "APPROVED_MANDOR",
          totalWeight: 50000,
          acceptedWeight: 0,
          panenIds: ["panen-3"],
          timestamp: "2026-04-13T12:00:00",
        },
      ],
    }));

    render(<AdminPengirimanPage />);

    expect(screen.getByRole("heading", { name: /^pengiriman$/i })).toBeInTheDocument();
    expect(screen.getByText("Awan Mandor")).toBeInTheDocument();
    expect(screen.getByText("Citra Mandor")).toBeInTheDocument();
    expect(screen.getByText(/supir: ega jawa/i)).toBeInTheDocument();
    expect(screen.getByText("200 kg")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /approve/i })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: /partial/i })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: /reject/i })).toHaveLength(2);
  });

  it("opens the reject panel for an admin rejection flow", () => {
    render(<AdminPengirimanPage />);

    fireEvent.click(screen.getByRole("button", { name: /reject/i }));

    expect(screen.getByRole("heading", { name: /tolak pengiriman/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/tuliskan alasan penolakan/i)).toBeInTheDocument();
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

  it("treats blank filter as undefined and resets all filters", () => {
    render(<AdminPengirimanPage />);

    fireEvent.change(screen.getByLabelText(/filter nama mandor/i), {
      target: { value: "   " },
    });
    fireEvent.change(screen.getByLabelText(/filter tanggal/i), {
      target: { value: "2026-04-13" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^cari$/i }));

    expect(mockUseApprovedDeliveriesForAdmin).toHaveBeenLastCalledWith({
      mandorName: undefined,
      date: "2026-04-13",
    }, {
      enabled: true,
    });

    fireEvent.click(screen.getByRole("button", { name: /reset/i }));

    expect(screen.getByLabelText(/filter nama mandor/i)).toHaveValue("");
    expect(screen.getByLabelText(/filter tanggal/i)).toHaveValue("");
    expect(mockUseApprovedDeliveriesForAdmin).toHaveBeenLastCalledWith({
      mandorName: undefined,
      date: undefined,
    }, {
      enabled: true,
    });
  });

  it("shows login and forbidden states", () => {
    mockGetToken.mockReturnValue("");

    const { rerender } = render(<AdminPengirimanPage />);

    expect(screen.getByText(/perlu login terlebih dahulu/i)).toBeInTheDocument();
    expect(mockUseApprovedDeliveriesForAdmin).toHaveBeenLastCalledWith({
      mandorName: undefined,
      date: undefined,
    }, {
      enabled: false,
    });

    mockGetToken.mockReturnValue("token");
    mockGetRole.mockReturnValue("MANDOR");
    rerender(<AdminPengirimanPage />);

    expect(screen.getByRole("heading", { name: /akses terbatas/i })).toBeInTheDocument();
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

  it("handles a full approve mutation rejection", async () => {
    mockAdminMutateAsync.mockRejectedValueOnce(new Error("Approve gagal"));
    render(<AdminPengirimanPage />);

    fireEvent.click(screen.getByRole("button", { name: /^approve$/i }));

    await waitFor(() => expect(mockAdminMutateAsync).toHaveBeenCalledWith({
      pengirimanId: "pengiriman-1",
      payload: {
        acceptedWeight: 200000,
        status: "APPROVED_ADMIN",
      },
    }));
  });

  it("submits a partial accept payload in grams", () => {
    render(<AdminPengirimanPage />);

    fireEvent.click(screen.getByRole("button", { name: /partial/i }));
    fireEvent.change(screen.getByPlaceholderText(/contoh: 175/i), {
      target: { value: "175" },
    });
    fireEvent.change(screen.getByPlaceholderText(/tuliskan alasan partial accept/i), {
      target: { value: "Sebagian sawit rusak" },
    });
    fireEvent.click(screen.getByRole("button", { name: /konfirmasi/i }));

    expect(mockAdminMutateAsync).toHaveBeenCalledWith({
      pengirimanId: "pengiriman-1",
      payload: {
        acceptedWeight: 175000,
        status: "PARTIAL",
        reason: "Sebagian sawit rusak",
      },
    });
  });

  it("validates partial accept input before submitting", () => {
    render(<AdminPengirimanPage />);

    fireEvent.click(screen.getByRole("button", { name: /partial/i }));
    fireEvent.click(screen.getByRole("button", { name: /konfirmasi/i }));

    expect(screen.getByText(/masukkan berat parsial/i)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/contoh: 175/i), {
      target: { value: "200" },
    });
    fireEvent.click(screen.getByRole("button", { name: /konfirmasi/i }));

    expect(screen.getByText(/lebih kecil dari total pengiriman/i)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/contoh: 175/i), {
      target: { value: "175" },
    });
    fireEvent.click(screen.getByRole("button", { name: /konfirmasi/i }));

    expect(screen.getByText(/alasan partial accept wajib diisi/i)).toBeInTheDocument();
    expect(mockAdminMutateAsync).not.toHaveBeenCalled();
  });

  it("cancels and handles failed partial accept", async () => {
    mockAdminMutateAsync.mockRejectedValueOnce(new Error("Partial gagal"));
    render(<AdminPengirimanPage />);

    fireEvent.click(screen.getByRole("button", { name: /partial/i }));
    fireEvent.change(screen.getByPlaceholderText(/contoh: 175/i), {
      target: { value: "175" },
    });
    fireEvent.change(screen.getByPlaceholderText(/tuliskan alasan partial accept/i), {
      target: { value: "Sebagian rusak" },
    });
    fireEvent.click(screen.getByRole("button", { name: /batal/i }));

    expect(screen.queryByPlaceholderText(/contoh: 175/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /partial/i }));
    fireEvent.change(screen.getByPlaceholderText(/contoh: 175/i), {
      target: { value: "175" },
    });
    fireEvent.change(screen.getByPlaceholderText(/tuliskan alasan partial accept/i), {
      target: { value: "Sebagian rusak" },
    });
    fireEvent.click(screen.getByRole("button", { name: /konfirmasi/i }));

    await waitFor(() => expect(mockAdminMutateAsync).toHaveBeenCalledWith({
      pengirimanId: "pengiriman-1",
      payload: {
        acceptedWeight: 175000,
        status: "PARTIAL",
        reason: "Sebagian rusak",
      },
    }));
    expect(screen.getByPlaceholderText(/contoh: 175/i)).toBeInTheDocument();
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

  it("handles failed admin rejection without closing the panel", async () => {
    mockAdminMutateAsync.mockRejectedValueOnce(new Error("Reject gagal"));
    render(<AdminPengirimanPage />);

    fireEvent.click(screen.getByRole("button", { name: /reject/i }));
    fireEvent.change(screen.getByPlaceholderText(/tuliskan alasan penolakan/i), {
      target: { value: "Dokumen tidak sesuai" },
    });
    fireEvent.click(screen.getByRole("button", { name: /konfirmasi/i }));

    await waitFor(() => expect(mockAdminMutateAsync).toHaveBeenCalledWith({
      pengirimanId: "pengiriman-1",
      payload: {
        acceptedWeight: 0,
        status: "REJECTED_ADMIN",
        reason: "Dokumen tidak sesuai",
      },
    }));
    expect(screen.getByPlaceholderText(/tuliskan alasan penolakan/i)).toBeInTheDocument();
  });

  it("shows query loading, fallback error, empty, and id fallback states", () => {
    const refetch = vi.fn();
    mockUseApprovedDeliveriesForAdmin.mockReturnValueOnce(createQueryState({ isLoading: true }));
    const { rerender } = render(<AdminPengirimanPage />);

    expect(screen.getByText(/memuat pengiriman yang siap diproses/i)).toBeInTheDocument();

    mockUseApprovedDeliveriesForAdmin.mockReturnValueOnce(createQueryState({
      isError: true,
      error: new Error("Admin gagal"),
      refetch,
    }));
    rerender(<AdminPengirimanPage />);

    expect(screen.getByText("Admin gagal")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /coba lagi/i }));
    expect(refetch).toHaveBeenCalled();

    mockUseApprovedDeliveriesForAdmin.mockReturnValueOnce(createQueryState({
      isError: true,
      error: "bad",
      refetch,
    }));
    rerender(<AdminPengirimanPage />);

    expect(screen.getByText(/gagal memuat pengiriman/i)).toBeInTheDocument();

    mockUseApprovedDeliveriesForAdmin.mockReturnValueOnce(createQueryState({ data: undefined }));
    rerender(<AdminPengirimanPage />);

    expect(screen.getByRole("heading", { name: /belum ada pengiriman/i })).toBeInTheDocument();

    mockUseApprovedDeliveriesForAdmin.mockReturnValue(createQueryState({
      data: [
        {
          pengirimanId: "pengiriman-2",
          supirId: "supir-2",
          supirName: null,
          mandorId: "mandor-2",
          mandorName: null,
          status: "APPROVED_MANDOR",
          totalWeight: 50000,
          acceptedWeight: 0,
          panenIds: null,
          timestamp: "2026-04-13T11:00:00",
        },
      ],
    }));
    rerender(<AdminPengirimanPage />);

    expect(screen.getByText("mandor-2")).toBeInTheDocument();
    expect(screen.getByText(/supir: supir-2/i)).toBeInTheDocument();
    expect(screen.getByText(/0 item panen/i)).toBeInTheDocument();
  });
});
