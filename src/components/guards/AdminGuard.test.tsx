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

import AdminGuard from "./AdminGuard";

afterEach(() => {
  cleanup();
});

describe("AdminGuard", () => {
  it("renders RoleGuard with ADMIN role and logout mode", () => {
    render(
      <AdminGuard>
        <div data-testid="content">Admin Content</div>
      </AdminGuard>,
    );

    const guard = screen.getByTestId("roleguard");
    expect(guard).toBeInTheDocument();
    expect(guard.getAttribute("data-allowed")).toBe("ADMIN");
    expect(guard.getAttribute("data-mode")).toBe("logout");
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });
});
