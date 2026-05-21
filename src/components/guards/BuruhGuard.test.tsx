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

import BuruhGuard from "./BuruhGuard";

afterEach(() => {
  cleanup();
});

describe("BuruhGuard", () => {
  it("renders RoleGuard with BURUH role and redirect mode", () => {
    render(
      <BuruhGuard>
        <div data-testid="content">Buruh Content</div>
      </BuruhGuard>,
    );

    const guard = screen.getByTestId("roleguard");
    expect(guard).toBeInTheDocument();
    expect(guard.getAttribute("data-allowed")).toBe("BURUH");
    expect(guard.getAttribute("data-mode")).toBe("redirect");
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });
});
