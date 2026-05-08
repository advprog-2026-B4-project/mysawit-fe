// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import BuruhPanenHistory from "./BuruhPanenHistory";

// Mock Hooks
vi.mock("@/modules/auth", () => ({
  useCurrentUser: vi.fn(),
}));
vi.mock("../hooks/usePanenList", () => ({
  usePanenByBuruh: vi.fn(),
}));

import { useCurrentUser } from "@/modules/auth";
import { usePanenByBuruh } from "../hooks/usePanenList";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("BuruhPanenHistory Component", () => {
    it("memanggil refetch saat tombol 'Coba lagi' diklik", () => {
    const refetchMock = vi.fn();
    vi.mocked(useCurrentUser).mockReturnValue({
      isLoading: false,
      data: null,
      isError: true,
      error: new Error("Sesi habis"),
      refetch: refetchMock, // Masukkan mock refetch di sini
    } as any);

    vi.mocked(usePanenByBuruh).mockReturnValue({
      isLoading: false,
      data: [],
    } as any);

    render(<BuruhPanenHistory />);
    
    // Line 91: Klik tombol Coba lagi
    fireEvent.click(screen.getByRole("button", { name: /Coba lagi/i }));
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });

  it("mengisi input tanggal, menerapkan, dan mereset filter", () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      isLoading: false,
      data: { userId: "U-123" },
    } as any);
    
    const panenMock = vi.mocked(usePanenByBuruh).mockReturnValue({
      isLoading: false,
      data: [],
    } as any);

    render(<BuruhPanenHistory />);

    // Line 125-137: Simulasi mengisi tanggal (karena type="date", kita pakai querySelector)
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const startInput = dateInputs[0];
    const endInput = dateInputs[1];

    fireEvent.change(startInput, { target: { value: "2026-05-01" } });
    fireEvent.change(endInput, { target: { value: "2026-05-08" } });

    // Terapkan filter
    fireEvent.click(screen.getByRole("button", { name: /Terapkan/i }));
    expect(panenMock).toHaveBeenLastCalledWith("U-123", expect.objectContaining({
      startDate: "2026-05-01",
      endDate: "2026-05-08"
    }));

    // Line 69-72: Reset filter
    fireEvent.click(screen.getByRole("button", { name: /Reset/i }));
    
    // Pastikan input kembali kosong
    expect((startInput as HTMLInputElement).value).toBe("");
    expect((endInput as HTMLInputElement).value).toBe("");
    // Pastikan hook dipanggil dengan filter kosong
    expect(panenMock).toHaveBeenLastCalledWith("U-123", {});
  });

  it("merender error panen jika terjadi kegagalan fetching list panen", () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      isLoading: false,
      data: { userId: "U-123" },
    } as any);
    
    // Memberikan error pada hook list panen
    vi.mocked(usePanenByBuruh).mockReturnValue({
      isLoading: false,
      data: [],
      error: new Error("Koneksi ke server terputus"),
    } as any);

    render(<BuruhPanenHistory />);
    expect(screen.getByText("Koneksi ke server terputus")).toBeInTheDocument();
  });

  it("merender foto bukti panen jika tersedia", () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      isLoading: false,
      data: { userId: "U-123" },
    } as any);
    
    vi.mocked(usePanenByBuruh).mockReturnValue({
      isLoading: false,
      data: [
        {
          panenId: "P-02",
          timestamp: "2026-05-08T00:00:00.000Z",
          description: "Panen dengan foto",
          weight: 1000,
          status: "APPROVED",
          // Line 230: Berikan array foto yang tidak kosong
          photos: [
            { photoId: "foto-1", url: "https://example.com/foto1.jpg" }
          ],
        }
      ],
      isError: false,
    } as any);

    render(<BuruhPanenHistory />);
    
    // Pastikan gambar di-render berdasarkan alt tag
    const img = screen.getByAltText("Preview");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/foto1.jpg");
  });
  it("merender state loading pengguna", () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      isLoading: true,
      data: null,
      isError: false,
    } as any);

    // Tambahkan mock kosongan ini agar tidak error saat di-destructure komponen
    vi.mocked(usePanenByBuruh).mockReturnValue({
      isLoading: false,
      data: [],
    } as any);

    render(<BuruhPanenHistory />);
    expect(screen.getByText(/Memuat data pengguna/i)).toBeInTheDocument();
  });

  it("merender state error pengguna", () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      isLoading: false,
      data: null,
      isError: true,
      error: new Error("Sesi habis"),
      refetch: vi.fn(),
    } as any);

    // Tambahkan mock kosongan ini juga
    vi.mocked(usePanenByBuruh).mockReturnValue({
      isLoading: false,
      data: [],
    } as any);

    render(<BuruhPanenHistory />);
    expect(screen.getByText("Sesi habis")).toBeInTheDocument();
  });

  it("merender tabel kosong saat tidak ada data panen", () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      isLoading: false,
      data: { userId: "U-123" },
      isError: false,
    } as any);
    
    vi.mocked(usePanenByBuruh).mockReturnValue({
      isLoading: false,
      data: [],
      isError: false,
    } as any);

    render(<BuruhPanenHistory />);
    expect(screen.getByText(/Belum ada data panen/i)).toBeInTheDocument();
  });

  it("merender data panen dengan format yang benar", () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      isLoading: false,
      data: { userId: "U-123" },
    } as any);
    
    vi.mocked(usePanenByBuruh).mockReturnValue({
      isLoading: false,
      data: [
        {
          panenId: "P-01",
          timestamp: "2026-05-08T00:00:00.000Z",
          description: "Panen Blok A",
          weight: 2500,
          status: "REJECTED",
          rejectionReason: "Foto gelap",
          photos: [],
        }
      ],
      isError: false,
    } as any);

    render(<BuruhPanenHistory />);
    
    expect(screen.getByText("Panen Blok A")).toBeInTheDocument();
    expect(screen.getByText("2.500")).toBeInTheDocument();
    expect(screen.getByText("Ditolak", { selector: 'span' })).toBeInTheDocument(); // Badge
    expect(screen.getByText("Foto gelap")).toBeInTheDocument(); // Keterangan error
  });

  it("menyimpan filter dan memanggil ulang hook saat Terapkan diklik", () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      isLoading: false,
      data: { userId: "U-123" },
    } as any);
    
    const panenMock = vi.mocked(usePanenByBuruh).mockReturnValue({
      isLoading: false,
      data: [],
    } as any);

    render(<BuruhPanenHistory />);

    // Ubah status dropdown
    const selectStatus = screen.getByRole("combobox");
    fireEvent.change(selectStatus, { target: { value: "APPROVED" } });

    // Klik Terapkan
    fireEvent.click(screen.getByRole("button", { name: /Terapkan/i }));

    // Cek apakah hook dipanggil dengan filter yang benar (panggilan terakhir)
    expect(panenMock).toHaveBeenLastCalledWith("U-123", { status: "APPROVED" });
  });
});