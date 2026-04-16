// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
    render(<MandorPengirimanPage />);

    expect(screen.getByRole("heading", { name: /manajemen pengiriman/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /tugaskan pengiriman/i })).toBeInTheDocument();
    expect(screen.getByText("Buruh A")).toBeInTheDocument();
    expect(screen.getByText("Ega Jawa")).toBeInTheDocument();
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

  it("submits mandor approval for a tiba delivery", () => {
    render(<MandorPengirimanPage />);

    fireEvent.click(screen.getByRole("button", { name: /setujui/i }));

    expect(mockApproveMutateAsync).toHaveBeenCalledWith("pengiriman-1");
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
});
