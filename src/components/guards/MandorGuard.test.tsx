// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/guards/RoleGuard", () => ({
  default: ({ children, allowedRoles, unauthorizedMode }: { children: React.ReactNode; allowedRoles: string[]; unauthorizedMode: string }) => (
    <div data-testid="roleguard" data-allowed={allowedRoles.join(",")} data-mode={unauthorizedMode}>
      {children}
    </div>
  ),
}));

import MandorGuard from "./MandorGuard";

afterEach(() => {
  cleanup();
});

describe("MandorGuard", () => {
  it("renders RoleGuard with MANDOR role and redirect mode", () => {
    render(
      <MandorGuard>
        <div data-testid="content">Mandor Content</div>
      </MandorGuard>,
    );

    const guard = screen.getByTestId("roleguard");
    expect(guard).toBeInTheDocument();
    expect(guard.getAttribute("data-allowed")).toBe("MANDOR");
    expect(guard.getAttribute("data-mode")).toBe("redirect");
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });
});
