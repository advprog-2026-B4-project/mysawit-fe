
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { VariabelPokokDTO } from "../api/pembayaranApi";
import VariabelPokokEditor from "./VariabelPokokEditor";

// Mock the mutation hook
const mutateMock = vi.fn();
const resetMock = vi.fn();

vi.mock("../hooks/useVariabelPokok", () => ({
  useUpdateVariabelPokok: () => ({
    mutate: mutateMock,
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    reset: resetMock,
  }),
}));

// Fixtures
const ITEMS: VariabelPokokDTO[] = [
  { key: "UPAH_BURUH", label: "Upah Buruh", description: "Upah per kg buruh", value: 500 },
  { key: "UPAH_SUPIR", label: "Upah Supir", description: "Upah per kg supir", value: 300 },
  { key: "UPAH_MANDOR", label: "Upah Mandor", description: "Upah per kg mandor", value: 200 },
];

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("VariabelPokokEditor - read-only mode", () => {
  beforeEach(() => render(<VariabelPokokEditor items={ITEMS} readOnly />));

  it("renders all item labels", () => {
    expect(screen.getByText("Upah Buruh")).toBeInTheDocument();
    expect(screen.getByText("Upah Supir")).toBeInTheDocument();
    expect(screen.getByText("Upah Mandor")).toBeInTheDocument();
  });

  it("does not render any Ubah button", () => {
    expect(screen.queryByRole("button", { name: /ubah/i })).not.toBeInTheDocument();
  });

  it("displays formatted values", () => {
    // Values are in separate spans, so check for the numbers and units separately
    expect(screen.getByText("500")).toBeInTheDocument();
    expect(screen.getByText("300")).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();
    // Check that the unit text is present
    expect(screen.getAllByText(/\/ kg/)).toHaveLength(3);
  });
});

describe("VariabelPokokEditor - editable mode", () => {
  beforeEach(() => render(<VariabelPokokEditor items={ITEMS} />));

  it("renders an Ubah button for each item", () => {
    expect(screen.getAllByRole("button", { name: /ubah/i })).toHaveLength(3);
  });

  it("shows edit form when Ubah is clicked", () => {
    fireEvent.click(screen.getAllByRole("button", { name: /ubah/i })[0]);
    expect(screen.getByRole("button", { name: /simpan/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /batal/i })).toBeInTheDocument();
  });

  it("pre-fills the input with the current value", () => {
    fireEvent.click(screen.getAllByRole("button", { name: /ubah/i })[0]);
    const input = screen.getByRole("spinbutton");
    expect((input as HTMLInputElement).value).toBe("500");
  });

  it("cancels editing and hides the form", () => {
    fireEvent.click(screen.getAllByRole("button", { name: /ubah/i })[0]);
    fireEvent.click(screen.getByRole("button", { name: /batal/i }));
    expect(screen.queryByRole("button", { name: /simpan/i })).not.toBeInTheDocument();
  });

  it("shows validation error for a non-positive value", async () => {
    fireEvent.click(screen.getAllByRole("button", { name: /ubah/i })[0]);
    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "-1" } });
    const form = input.closest("form")!;
    fireEvent.submit(form);
    await waitFor(
      () =>
        expect(
          screen.getByText(/nilai harus berupa bilangan bulat positif/i),
        ).toBeInTheDocument(),
      { timeout: 2000 }
    );
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("shows validation error for a decimal value", async () => {
    fireEvent.click(screen.getAllByRole("button", { name: /ubah/i })[0]);
    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "1.5" } });
    const form = input.closest("form")!;
    fireEvent.submit(form);
    await waitFor(
      () =>
        expect(
          screen.getByText(/nilai harus berupa bilangan bulat positif/i),
        ).toBeInTheDocument(),
      { timeout: 2000 }
    );
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("calls mutate with correct args on valid submit", async () => {
    fireEvent.click(screen.getAllByRole("button", { name: /ubah/i })[0]);
    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "750" } });
    fireEvent.click(screen.getByRole("button", { name: /simpan/i }));
    await waitFor(() =>
      expect(mutateMock).toHaveBeenCalledWith(
        { key: "UPAH_BURUH", newValue: 750 },
        expect.any(Object),
      ),
    );
  });
});
