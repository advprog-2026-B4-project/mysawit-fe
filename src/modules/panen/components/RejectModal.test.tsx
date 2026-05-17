// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RejectModal from "./RejectModal";

const onConfirmMock = vi.fn();
const onCancelMock = vi.fn();

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("RejectModal - state normal", () => {
  beforeEach(() => 
    render(
      <RejectModal 
        panenId="panen-123" 
        onConfirm={onConfirmMock} 
        onCancel={onCancelMock} 
        isLoading={false} 
      />
    )
  );

  it("merender modal beserta elemennya", () => {
    expect(screen.getByText("Tolak Laporan Panen")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /batal/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /tolak/i })).toBeInTheDocument();
  });

  it("menonaktifkan tombol tolak saat alasan kosong", () => {
    const rejectBtn = screen.getByRole("button", { name: /tolak/i });
    expect(rejectBtn).toBeDisabled();
  });

  it("mengisi input alasan dan memanggil onConfirm saat submit", () => {
    const input = screen.getByRole("textbox");
    // Menggunakan fireEvent.change sesuai gaya VariabelPokokEditor
    fireEvent.change(input, { target: { value: "Berat tidak sesuai" } });

    const rejectBtn = screen.getByRole("button", { name: /tolak/i });
    expect(rejectBtn).not.toBeDisabled();

    // Menggunakan fireEvent.click
    fireEvent.click(rejectBtn);

    expect(onConfirmMock).toHaveBeenCalledWith("panen-123", "Berat tidak sesuai");
  });

  it("memanggil onCancel saat tombol batal diklik", () => {
    fireEvent.click(screen.getByRole("button", { name: /batal/i }));
    expect(onCancelMock).toHaveBeenCalled();
  });
});

describe("RejectModal - state loading", () => {
  beforeEach(() => 
    render(
      <RejectModal 
        panenId="panen-123" 
        onConfirm={onConfirmMock} 
        onCancel={onCancelMock} 
        isLoading={true} 
      />
    )
  );

  it("mengubah teks tombol dan menonaktifkannya saat loading", () => {
    const submitBtn = screen.getByRole("button", { name: /memproses/i });
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();
    
    const cancelBtn = screen.getByRole("button", { name: /batal/i });
    expect(cancelBtn).toBeDisabled();
  });
});