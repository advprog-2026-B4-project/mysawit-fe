// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mockPush = vi.fn();
const mockLogout = vi.fn();

let mockIsAuthenticated: () => boolean = () => false;
let mockGetRole: () => string | undefined = () => undefined;

vi.mock("@/modules/auth", () => ({
  useAuth: () => ({
    isAuthenticated: mockIsAuthenticated,
    logout: mockLogout,
  }),
}));

vi.mock("@/lib/api/tokenStorage", () => ({
  getRole: () => mockGetRole(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

import RoleGuard from "./RoleGuard";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  mockIsAuthenticated = () => false;
  mockGetRole = () => undefined;
});

describe("RoleGuard - unauthenticated (redirect mode)", () => {
  it("shows verifying screen when user is unauthenticated", () => {
    render(
      <RoleGuard allowedRoles={["ADMIN"]}>
        <div data-testid="protected">Protected Content</div>
      </RoleGuard>,
    );

    expect(
      screen.getByText(/memverifikasi/i),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("protected")).not.toBeInTheDocument();
  });
});

describe("RoleGuard - authorized", () => {
  it("renders children when authenticated and role matches", async () => {
    mockIsAuthenticated = () => true;
    mockGetRole = () => "ADMIN";

    render(
      <RoleGuard allowedRoles={["ADMIN", "MANDOR"]}>
        <div data-testid="protected">Protected Content</div>
      </RoleGuard>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("protected")).toBeInTheDocument();
    });

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});

describe("RoleGuard - wrong role (redirect mode, default)", () => {
  it("shows verifying screen when role does not match", () => {
    mockIsAuthenticated = () => true;
    mockGetRole = () => "BURUH";

    render(
      <RoleGuard allowedRoles={["ADMIN"]}>
        <div data-testid="protected">Protected Content</div>
      </RoleGuard>,
    );

    expect(
      screen.getByText(/memverifikasi/i),
    ).toBeInTheDocument();
  });
});

describe("RoleGuard - wrong role (logout mode)", () => {
  it("shows verifying screen when unauthorizedMode is logout", () => {
    mockIsAuthenticated = () => true;
    mockGetRole = () => "BURUH";

    render(
      <RoleGuard allowedRoles={["ADMIN"]} unauthorizedMode="logout">
        <div data-testid="protected">Protected Content</div>
      </RoleGuard>,
    );

    expect(
      screen.getByText(/memverifikasi/i),
    ).toBeInTheDocument();
  });
});

describe("RoleGuard - custom redirect paths", () => {
  it("accepts custom unauthenticatedRedirectTo", () => {
    render(
      <RoleGuard
        allowedRoles={["ADMIN"]}
        unauthenticatedRedirectTo="/custom-login"
        unauthorizedRedirectTo="/custom-home"
      >
        <div>Content</div>
      </RoleGuard>,
    );

    expect(
      screen.getByText(/memverifikasi/i),
    ).toBeInTheDocument();
  });
});
