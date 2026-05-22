
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("react-hot-toast", () => ({
  Toaster: vi.fn(() => <div data-testid="toaster-mock" />),
}));

import { AppToaster } from "./AppToaster";

afterEach(() => {
  cleanup();
});

describe("AppToaster", () => {
  it("renders without crashing", () => {
    render(<AppToaster />);
    expect(screen.getByTestId("toaster-mock")).toBeInTheDocument();
  });
});
