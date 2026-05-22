
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RoleBadge } from "./Badge";

afterEach(() => {
  cleanup();
});

describe("RoleBadge", () => {
  it("renders ADMIN badge", () => {
    render(<RoleBadge userRole="ADMIN" />);
    const badge = screen.getByText("Admin");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("text-forest");
  });

  it("renders MANDOR badge", () => {
    render(<RoleBadge userRole="MANDOR" />);
    const badge = screen.getByText("Mandor");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("text-bark");
  });

  it("renders BURUH badge", () => {
    render(<RoleBadge userRole="BURUH" />);
    const badge = screen.getByText("Buruh");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("text-[#7a6020]");
  });

  it("renders SUPIR badge", () => {
    render(<RoleBadge userRole="SUPIR" />);
    const badge = screen.getByText("Supir");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("text-[#1a3d5c]");
  });

  it("renders with uppercase text style", () => {
    render(<RoleBadge userRole="ADMIN" />);
    const badge = screen.getByText("Admin");
    expect(badge.className).toContain("uppercase");
  });
});
