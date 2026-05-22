
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Button } from "./Button";

afterEach(() => {
  cleanup();
});

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>Simpan</Button>);
    expect(screen.getByRole("button", { name: /simpan/i })).toBeInTheDocument();
  });

  it("renders with primary variant by default", () => {
    render(<Button>Kirim</Button>);
    const btn = screen.getByRole("button", { name: /kirim/i });
    expect(btn.className).toContain("bg-forest");
  });

  it("renders with secondary variant classes", () => {
    render(<Button variant="secondary">Batal</Button>);
    const btn = screen.getByRole("button", { name: /batal/i });
    expect(btn.className).toContain("border-forest");
    expect(btn.className).toContain("bg-transparent");
  });

  it("renders with ghost variant classes", () => {
    render(<Button variant="ghost">Kembali</Button>);
    const btn = screen.getByRole("button", { name: /kembali/i });
    expect(btn.className).toContain("bg-transparent");
    expect(btn.className).toContain("text-text-mid");
  });

  it("renders with danger variant classes", () => {
    render(<Button variant="danger">Hapus</Button>);
    const btn = screen.getByRole("button", { name: /hapus/i });
    expect(btn.className).toContain("text-error");
    expect(btn.className).toContain("border-error");
  });

  it("disables button when disabled prop is true", () => {
    render(<Button disabled>Simpan</Button>);
    expect(screen.getByRole("button", { name: /simpan/i })).toBeDisabled();
  });

  it("disables button and shows loading text when loading=true", () => {
    render(<Button loading>Simpan</Button>);
    const btn = screen.getByRole("button", { name: /memproses/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toBeDisabled();
  });

  it("applies additional className", () => {
    render(<Button className="mt-4">Simpan</Button>);
    const btn = screen.getByRole("button", { name: /simpan/i });
    expect(btn.className).toContain("mt-4");
  });

  it("passes onClick handler", () => {
    let clicked = false;
    render(<Button onClick={() => { clicked = true; }}>Klik</Button>);
    screen.getByRole("button", { name: /klik/i }).click();
    expect(clicked).toBe(true);
  });

  it("does not fire onClick when disabled", () => {
    let clicked = false;
    render(<Button disabled onClick={() => { clicked = true; }}>Klik</Button>);
    screen.getByRole("button", { name: /klik/i }).click();
    expect(clicked).toBe(false);
  });

  it("does not fire onClick when loading", () => {
    let clicked = false;
    render(<Button loading onClick={() => { clicked = true; }}>Klik</Button>);
    screen.getByRole("button", { name: /memproses/i }).click();
    expect(clicked).toBe(false);
  });
});
