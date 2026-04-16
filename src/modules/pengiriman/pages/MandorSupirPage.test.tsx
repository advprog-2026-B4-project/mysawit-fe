// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
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
    render(<MandorSupirPage />);

    expect(screen.getByRole("heading", { name: /supir kebun saya/i })).toBeInTheDocument();
    expect(screen.getByText(/daftar supir truk yang bertugas di kebun/i)).toBeInTheDocument();
    expect(screen.getByText("Ega Jawa")).toBeInTheDocument();
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

  it("shows the empty state when no supir is available", () => {
    mockUseMandorSupirList.mockReturnValue(createQueryState({ data: [] }));

    render(<MandorSupirPage />);

    expect(screen.getByRole("heading", { name: /belum ada supir/i })).toBeInTheDocument();
    expect(screen.getByText(/tidak ada supir yang cocok dengan filter/i)).toBeInTheDocument();
  });
});
