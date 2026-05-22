
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MandorSupirPage from "./MandorSupirPage";

const mockGetToken = vi.fn();
const mockGetRole = vi.fn();
const mockUseMandorSupirList = vi.fn();

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock("@/lib/api/tokenStorage", () => ({
  getToken: () => mockGetToken(),
  getRole: () => mockGetRole(),
}));

vi.mock("../hooks/usePengiriman", () => ({
  useMandorSupirList: (...args: unknown[]) => mockUseMandorSupirList(...args),
}));

function createQueryState(overrides?: Record<string, unknown>) {
  return {
    data: [
      {
        supirId: "supir-1",
        username: "ega",
        name: "Ega Jawa",
        email: "ega@example.com",
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
  mockGetRole.mockReturnValue("MANDOR");
  mockUseMandorSupirList.mockReturnValue(createQueryState());
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("MandorSupirPage", () => {
  it("renders the assigned supir list and filter controls", () => {
    mockUseMandorSupirList.mockReturnValue(createQueryState({
      data: [
        {
          supirId: "supir-1",
          username: "ega",
          name: "Ega Jawa",
          email: "ega@example.com",
        },
        {
          supirId: "supir-2",
          username: "bima",
          name: "Bima Raya",
          email: "bima@example.com",
        },
      ],
    }));

    render(<MandorSupirPage />);

    expect(screen.getByRole("heading", { name: /supir kebun saya/i })).toBeInTheDocument();
    expect(screen.getByText(/daftar supir truk yang bertugas di kebun/i)).toBeInTheDocument();
    expect(screen.getByText("Ega Jawa")).toBeInTheDocument();
    expect(screen.getByText("Bima Raya")).toBeInTheDocument();
    expect(screen.getByText("ega@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cari/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
  });

  it("submits and resets the nama filter", () => {
    render(<MandorSupirPage />);

    fireEvent.change(screen.getByPlaceholderText(/contoh: ega/i), {
      target: { value: "Ega" },
    });
    fireEvent.click(screen.getByRole("button", { name: /cari/i }));

    expect(mockUseMandorSupirList.mock.calls.at(-1)?.[0]).toBe("Ega");

    fireEvent.click(screen.getByRole("button", { name: /reset/i }));

    expect(screen.getByPlaceholderText(/contoh: ega/i)).toHaveValue("");
    expect(mockUseMandorSupirList.mock.calls.at(-1)?.[0]).toBeUndefined();
  });

  it("treats a blank submitted filter as no filter", () => {
    render(<MandorSupirPage />);

    fireEvent.change(screen.getByPlaceholderText(/contoh: ega/i), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByRole("button", { name: /cari/i }));

    expect(mockUseMandorSupirList.mock.calls.at(-1)?.[0]).toBeUndefined();
  });

  it("shows the login prompt when no session exists", () => {
    mockGetToken.mockReturnValue("");

    render(<MandorSupirPage />);

    expect(screen.getByRole("heading", { name: /daftar supir kebun/i })).toBeInTheDocument();
    expect(screen.getByText(/perlu login terlebih dahulu/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /masuk/i })).toHaveAttribute("href", "/login");
    expect(mockUseMandorSupirList).toHaveBeenCalledWith(undefined, { enabled: false });
  });

  it("shows the forbidden state for non-mandor users", () => {
    mockGetRole.mockReturnValue("SUPIR");

    render(<MandorSupirPage />);

    expect(screen.getByRole("heading", { name: /akses terbatas/i })).toBeInTheDocument();
    expect(screen.getByText(/khusus untuk pengguna dengan role mandor/i)).toBeInTheDocument();
    expect(mockUseMandorSupirList).toHaveBeenCalledWith(undefined, { enabled: false });
  });

  it("shows the loading state", () => {
    mockUseMandorSupirList.mockReturnValue(createQueryState({ isLoading: true }));

    render(<MandorSupirPage />);

    expect(screen.getByText(/memuat daftar supir/i)).toBeInTheDocument();
  });

  it("shows the kebun dependency unavailable state and refetches", () => {
    const refetch = vi.fn();
    mockUseMandorSupirList.mockReturnValue(createQueryState({
      isError: true,
      error: new Error("Integrasi modul kebun belum siap"),
      refetch,
    }));

    render(<MandorSupirPage />);

    expect(screen.getByRole("heading", { name: /integrasi belum siap/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /coba lagi/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it("shows the generic error state and fallback message", () => {
    const refetch = vi.fn();
    mockUseMandorSupirList.mockReturnValue(createQueryState({
      isError: true,
      error: null,
      refetch,
    }));

    render(<MandorSupirPage />);

    expect(screen.getByText(/gagal memuat daftar supir/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /coba lagi/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it("shows the empty state when no supir is available", () => {
    mockUseMandorSupirList.mockReturnValue(createQueryState({ data: [] }));

    render(<MandorSupirPage />);

    expect(screen.getByRole("heading", { name: /belum ada supir/i })).toBeInTheDocument();
    expect(screen.getByText(/tidak ada supir yang cocok dengan filter/i)).toBeInTheDocument();
  });
});
