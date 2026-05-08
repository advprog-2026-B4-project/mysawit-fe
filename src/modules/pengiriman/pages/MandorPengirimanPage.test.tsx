// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MandorPengirimanPage from "./MandorPengirimanPage";

const mockGetToken = vi.fn();
const mockGetRole = vi.fn();
const mockUseMandorSupirList = vi.fn();
const mockUseAssignablePanenForMandor = vi.fn();
const mockUseMandorActiveDeliveries = vi.fn();
const mockUseAssignDelivery = vi.fn();
const mockUseMandorApproveDelivery = vi.fn();
const mockUseMandorRejectDelivery = vi.fn();
const mockAssignMutateAsync = vi.fn();
const mockApproveMutateAsync = vi.fn();
const mockRejectMutateAsync = vi.fn();

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock("@/lib/api/tokenStorage", () => ({
  getToken: () => mockGetToken(),
  getRole: () => mockGetRole(),
}));

vi.mock("../hooks/usePengiriman", () => ({
  useMandorSupirList: (...args: unknown[]) => mockUseMandorSupirList(...args),
  useAssignablePanenForMandor: (...args: unknown[]) => mockUseAssignablePanenForMandor(...args),
  useMandorActiveDeliveries: (...args: unknown[]) => mockUseMandorActiveDeliveries(...args),
  useAssignDelivery: () => mockUseAssignDelivery(),
  useMandorApproveDelivery: () => mockUseMandorApproveDelivery(),
  useMandorRejectDelivery: () => mockUseMandorRejectDelivery(),
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
  mockUseAssignablePanenForMandor.mockReturnValue(createQueryState({
    data: [
      {
        panenId: "panen-1",
        buruhId: "buruh-1",
        buruhName: "Buruh A",
        description: "Panen pagi",
        weight: 180000,
        timestamp: "2026-04-12T08:30:00",
      },
      {
        panenId: "panen-2",
        buruhId: "buruh-2",
        buruhName: "Buruh B",
        description: "Panen siang",
        weight: 270000,
        timestamp: "2026-04-12T12:00:00",
      },
    ],
  }));
  mockUseMandorActiveDeliveries.mockReturnValue(createQueryState({
    data: [
      {
        pengirimanId: "pengiriman-1",
        supirId: "supir-1",
        supirName: "Ega Jawa",
        mandorId: "mandor-1",
        status: "TIBA",
        totalWeight: 180000,
        acceptedWeight: 0,
        timestamp: "2026-04-12T10:00:00",
      },
    ],
  }));
  mockUseAssignDelivery.mockReturnValue({
    isPending: false,
    mutateAsync: mockAssignMutateAsync,
  });
  mockUseMandorApproveDelivery.mockReturnValue({
    isPending: false,
    mutateAsync: mockApproveMutateAsync,
  });
  mockUseMandorRejectDelivery.mockReturnValue({
    isPending: false,
    mutateAsync: mockRejectMutateAsync,
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("MandorPengirimanPage", () => {
  it("renders assignment and active delivery sections", () => {
    mockUseMandorActiveDeliveries.mockReturnValue(createQueryState({
      data: [
        {
          pengirimanId: "pengiriman-1",
          supirId: "supir-1",
          supirName: "Ega Jawa",
          mandorId: "mandor-1",
          status: "TIBA",
          totalWeight: 180000,
          acceptedWeight: 0,
          timestamp: "2026-04-12T10:00:00",
        },
        {
          pengirimanId: "pengiriman-2",
          supirId: "supir-2",
          supirName: "Bima Raya",
          mandorId: "mandor-1",
          status: "ASSIGNED",
          totalWeight: 90000,
          acceptedWeight: 0,
          statusReason: "Menunggu angkut",
          timestamp: "2026-04-12T11:00:00",
        },
      ],
    }));

    render(<MandorPengirimanPage />);

    expect(screen.getByRole("heading", { name: /manajemen pengiriman/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /tugaskan pengiriman/i })).toBeInTheDocument();
    expect(screen.getByText("Buruh A")).toBeInTheDocument();
    expect(screen.getByText("Ega Jawa")).toBeInTheDocument();
    expect(screen.getByText("Bima Raya")).toBeInTheDocument();
    expect(screen.getAllByText("180 kg")).toHaveLength(2);
    expect(screen.getByRole("button", { name: /tugaskan ke supir/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /setujui/i })).toBeInTheDocument();
  });

  it("submits a delivery assignment when a supir and panen are selected", () => {
    render(<MandorPengirimanPage />);

    fireEvent.change(screen.getByDisplayValue(/pilih supir kebun/i), {
      target: { value: "supir-1" },
    });
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    fireEvent.click(screen.getByRole("button", { name: /tugaskan ke supir/i }));

    expect(mockAssignMutateAsync).toHaveBeenCalledWith({
      supirId: "supir-1",
      panenIds: ["panen-1"],
    });
  });

  it("toggles a selected panen back off", () => {
    render(<MandorPengirimanPage />);

    const checkbox = screen.getAllByRole("checkbox")[0];
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("falls back to zero when a selected panen disappears from query data", () => {
    const { rerender } = render(<MandorPengirimanPage />);

    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    expect(screen.getAllByText("180 kg")).toHaveLength(3);

    mockUseAssignablePanenForMandor.mockReturnValue(createQueryState({ data: [] }));
    rerender(<MandorPengirimanPage />);

    expect(screen.getByText("0 kg")).toBeInTheDocument();
  });

  it("requires supir and panen before assigning a delivery", () => {
    render(<MandorPengirimanPage />);

    fireEvent.click(screen.getByRole("button", { name: /tugaskan ke supir/i }));
    expect(screen.getByText(/pilih supir terlebih dahulu/i)).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue(/pilih supir kebun/i), {
      target: { value: "supir-1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /tugaskan ke supir/i }));

    expect(screen.getByText(/pilih minimal satu panen/i)).toBeInTheDocument();
    expect(mockAssignMutateAsync).not.toHaveBeenCalled();
  });

  it("blocks assignment when total selected weight exceeds 400 kg", () => {
    render(<MandorPengirimanPage />);

    fireEvent.change(screen.getByDisplayValue(/pilih supir kebun/i), {
      target: { value: "supir-1" },
    });
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    fireEvent.click(screen.getAllByRole("checkbox")[1]);
    fireEvent.click(screen.getByRole("button", { name: /tugaskan ke supir/i }));

    expect(screen.getByText(/tidak boleh melebihi 400 kg/i)).toBeInTheDocument();
    expect(mockAssignMutateAsync).not.toHaveBeenCalled();
  });

  it("handles assignment mutation rejection without clearing the selection", async () => {
    mockAssignMutateAsync.mockRejectedValueOnce(new Error("Gagal assign"));
    render(<MandorPengirimanPage />);

    fireEvent.change(screen.getByDisplayValue(/pilih supir kebun/i), {
      target: { value: "supir-1" },
    });
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    fireEvent.click(screen.getByRole("button", { name: /tugaskan ke supir/i }));

    await waitFor(() => expect(mockAssignMutateAsync).toHaveBeenCalled());
    expect(screen.getAllByRole("checkbox")[0]).toBeChecked();
  });

  it("submits mandor approval for a tiba delivery", () => {
    render(<MandorPengirimanPage />);

    fireEvent.click(screen.getByRole("button", { name: /setujui/i }));

    expect(mockApproveMutateAsync).toHaveBeenCalledWith("pengiriman-1");
  });

  it("handles mandor approval mutation rejection", async () => {
    mockApproveMutateAsync.mockRejectedValueOnce(new Error("Gagal approve"));
    render(<MandorPengirimanPage />);

    fireEvent.click(screen.getByRole("button", { name: /setujui/i }));

    await waitFor(() => expect(mockApproveMutateAsync).toHaveBeenCalledWith("pengiriman-1"));
  });

  it("requires a reject reason before submitting mandor rejection", () => {
    render(<MandorPengirimanPage />);

    fireEvent.click(screen.getByRole("button", { name: /tolak/i }));
    fireEvent.click(screen.getByRole("button", { name: /konfirmasi tolak/i }));

    expect(screen.getByText(/alasan penolakan wajib diisi/i)).toBeInTheDocument();
    expect(mockRejectMutateAsync).not.toHaveBeenCalled();

    fireEvent.change(screen.getByPlaceholderText(/tuliskan alasan penolakan pengiriman/i), {
      target: { value: "Muatan rusak saat tiba" },
    });
    fireEvent.click(screen.getByRole("button", { name: /konfirmasi tolak/i }));

    expect(mockRejectMutateAsync).toHaveBeenCalledWith({
      pengirimanId: "pengiriman-1",
      reason: "Muatan rusak saat tiba",
    });
  });

  it("cancels and handles failed mandor rejection", async () => {
    mockRejectMutateAsync.mockRejectedValueOnce(new Error("Gagal tolak"));
    render(<MandorPengirimanPage />);

    fireEvent.click(screen.getByRole("button", { name: /tolak/i }));
    fireEvent.change(screen.getByPlaceholderText(/tuliskan alasan penolakan pengiriman/i), {
      target: { value: "Perlu inspeksi ulang" },
    });
    fireEvent.click(screen.getByRole("button", { name: /batal/i }));

    expect(screen.queryByPlaceholderText(/tuliskan alasan penolakan pengiriman/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /tolak/i }));
    fireEvent.change(screen.getByPlaceholderText(/tuliskan alasan penolakan pengiriman/i), {
      target: { value: "Perlu inspeksi ulang" },
    });
    fireEvent.click(screen.getByRole("button", { name: /konfirmasi tolak/i }));

    await waitFor(() => expect(mockRejectMutateAsync).toHaveBeenCalledWith({
      pengirimanId: "pengiriman-1",
      reason: "Perlu inspeksi ulang",
    }));
    expect(screen.getByPlaceholderText(/tuliskan alasan penolakan pengiriman/i)).toBeInTheDocument();
  });

  it("shows login and forbidden states", () => {
    mockGetToken.mockReturnValue("");

    const { rerender } = render(<MandorPengirimanPage />);

    expect(screen.getByText(/perlu login terlebih dahulu/i)).toBeInTheDocument();
    expect(mockUseMandorSupirList).toHaveBeenLastCalledWith(undefined, { enabled: false });

    mockGetToken.mockReturnValue("token");
    mockGetRole.mockReturnValue("ADMIN");
    rerender(<MandorPengirimanPage />);

    expect(screen.getByRole("heading", { name: /akses terbatas/i })).toBeInTheDocument();
  });

  it("shows panen query loading, error, and empty states", () => {
    const refetch = vi.fn();
    mockUseAssignablePanenForMandor.mockReturnValueOnce(createQueryState({ isLoading: true }));
    const { rerender } = render(<MandorPengirimanPage />);

    expect(screen.getByText(/memuat panen yang dapat dikirim/i)).toBeInTheDocument();

    mockUseAssignablePanenForMandor.mockReturnValueOnce(createQueryState({
      isError: true,
      error: new Error("Panen gagal"),
      refetch,
    }));
    rerender(<MandorPengirimanPage />);

    expect(screen.getByText("Panen gagal")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: /coba lagi/i })[0]);
    expect(refetch).toHaveBeenCalled();

    mockUseAssignablePanenForMandor.mockReturnValueOnce(createQueryState({
      isError: true,
      error: "bad",
      refetch,
    }));
    rerender(<MandorPengirimanPage />);

    expect(screen.getByText(/gagal memuat panen/i)).toBeInTheDocument();

    mockUseAssignablePanenForMandor.mockReturnValue(createQueryState({ data: undefined }));
    rerender(<MandorPengirimanPage />);

    expect(screen.getByText(/belum ada panen approved/i)).toBeInTheDocument();
  });

  it("shows active delivery loading, fallback error, empty, and non-tiba rows", () => {
    const refetch = vi.fn();
    mockUseMandorActiveDeliveries.mockReturnValueOnce(createQueryState({ isLoading: true }));
    const { rerender } = render(<MandorPengirimanPage />);

    expect(screen.getByText(/memuat pengiriman aktif/i)).toBeInTheDocument();

    mockUseMandorActiveDeliveries.mockReturnValueOnce(createQueryState({
      isError: true,
      error: new Error("Aktif gagal"),
      refetch,
    }));
    rerender(<MandorPengirimanPage />);

    expect(screen.getByText("Aktif gagal")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: /coba lagi/i }).at(-1)!);
    expect(refetch).toHaveBeenCalled();

    mockUseMandorActiveDeliveries.mockReturnValueOnce(createQueryState({
      isError: true,
      error: "bad",
      refetch,
    }));
    rerender(<MandorPengirimanPage />);

    expect(screen.getByText(/gagal memuat pengiriman aktif/i)).toBeInTheDocument();

    mockUseMandorActiveDeliveries.mockReturnValueOnce(createQueryState({ data: undefined }));
    rerender(<MandorPengirimanPage />);

    expect(screen.getByText(/belum ada pengiriman aktif/i)).toBeInTheDocument();

    mockUseMandorActiveDeliveries.mockReturnValue(createQueryState({
      data: [
        {
          pengirimanId: "pengiriman-2",
          supirId: "supir-2",
          supirName: null,
          mandorId: "mandor-1",
          status: "DIJADWALKAN",
          totalWeight: 90000,
          acceptedWeight: 0,
          statusReason: "Menunggu supir",
          timestamp: "2026-04-12T10:00:00",
        },
      ],
    }));
    rerender(<MandorPengirimanPage />);

    expect(screen.getByText("supir-2")).toBeInTheDocument();
    expect(screen.getByText("Menunggu supir")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /setujui/i })).not.toBeInTheDocument();
  });

  it("renders safely when optional query data is missing", () => {
    mockUseMandorSupirList.mockReturnValue(createQueryState({ data: undefined }));
    mockUseAssignablePanenForMandor.mockReturnValue(createQueryState({ data: undefined }));
    mockUseMandorActiveDeliveries.mockReturnValue(createQueryState({ data: undefined }));

    render(<MandorPengirimanPage />);

    expect(screen.getByDisplayValue(/pilih supir kebun/i)).toBeInTheDocument();
    expect(screen.getByText(/belum ada panen approved/i)).toBeInTheDocument();
    expect(screen.getByText(/belum ada pengiriman aktif/i)).toBeInTheDocument();
  });
});
