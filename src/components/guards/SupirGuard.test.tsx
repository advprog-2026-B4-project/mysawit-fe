
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/guards/RoleGuard", () => ({
  default: ({ children, allowedRoles, unauthorizedMode }: { children: React.ReactNode; allowedRoles: string[]; unauthorizedMode: string }) => (
    <div data-testid="roleguard" data-allowed={allowedRoles.join(",")} data-mode={unauthorizedMode}>
      {children}
    </div>
  ),
}));

import SupirGuard from "./SupirGuard";

afterEach(() => {
  cleanup();
});

describe("SupirGuard", () => {
  it("renders RoleGuard with SUPIR role and redirect mode", () => {
    render(
      <SupirGuard>
        <div data-testid="content">Supir Content</div>
      </SupirGuard>,
    );

    const guard = screen.getByTestId("roleguard");
    expect(guard).toBeInTheDocument();
    expect(guard.getAttribute("data-allowed")).toBe("SUPIR");
    expect(guard.getAttribute("data-mode")).toBe("redirect");
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });
});
