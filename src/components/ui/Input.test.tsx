// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Input } from "./Input";

afterEach(() => {
  cleanup();
});

describe("Input", () => {
  it("renders an input element", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(<Input label="Nama" />);
    expect(screen.getByText("Nama")).toBeInTheDocument();
  });

  it("does not render label when not provided", () => {
    render(<Input />);
    expect(screen.queryByRole("label")).not.toBeInTheDocument();
  });

  it("renders error message when provided", () => {
    render(<Input error="Nama wajib diisi" />);
    expect(screen.getByText("Nama wajib diisi")).toBeInTheDocument();
  });

  it("applies error border class when error is set", () => {
    render(<Input error="Wajib diisi" />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("border-error");
  });

  it("applies sand border when no error", () => {
    render(<Input />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("border-sand");
  });

  it("accepts and displays value", () => {
    render(<Input />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Hello" } });
    expect(input.value).toBe("Hello");
  });

  it("applies custom className", () => {
    render(<Input className="mt-4" />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("mt-4");
  });

  it("forwards additional HTML input props", () => {
    render(<Input placeholder="Masukkan nama" type="email" required />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("placeholder", "Masukkan nama");
    expect(input).toHaveAttribute("type", "email");
    expect(input).toBeRequired();
  });
});
