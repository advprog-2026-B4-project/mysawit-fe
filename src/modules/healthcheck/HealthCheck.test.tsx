
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

let mockResponse: { status: number; json: () => Promise<unknown> } | null = null;
let mockFetchError = false;

global.fetch = vi.fn(() => {
  if (mockFetchError) return Promise.reject(new Error("Network error"));
  return Promise.resolve(mockResponse);
}) as unknown as typeof fetch;

import HealthCheck from "./HealthCheck";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  mockResponse = null;
  mockFetchError = false;
});

describe("HealthCheck", () => {
  it("shows loading state initially", () => {
    mockResponse = null;

    render(<HealthCheck />);

    expect(screen.getByText("Loading")).toBeInTheDocument();
    expect(screen.getByText("Checking...")).toBeInTheDocument();
  });

  it("shows healthy state when backend returns OK", async () => {
    mockResponse = {
      status: 200,
      json: () =>
        Promise.resolve([
          {
            serviceName: "MySawit API",
            status: "OK",
            checkedAt: "2026-05-21T10:00:00.000Z",
          },
        ]),
    };

    render(<HealthCheck />);

    await waitFor(() => {
      expect(screen.getByText("MySawit API")).toBeInTheDocument();
    });

    expect(screen.getByText("OK")).toBeInTheDocument();
  });

  it("shows healthy state when backend returns single object", async () => {
    mockResponse = {
      status: 200,
      json: () =>
        Promise.resolve({
          serviceName: "MySawit API",
          status: "OK",
          checkedAt: "2026-05-21T10:00:00.000Z",
        }),
    };

    render(<HealthCheck />);

    await waitFor(() => {
      expect(screen.getByText("MySawit API")).toBeInTheDocument();
    });
  });

  it("shows unhealthy state when status is not OK", async () => {
    mockResponse = {
      status: 200,
      json: () =>
        Promise.resolve([
          {
            serviceName: "MySawit API",
            status: "DOWN",
            checkedAt: "2026-05-21T10:00:00.000Z",
          },
        ]),
    };

    render(<HealthCheck />);

    await waitFor(() => {
      expect(screen.getByText("MySawit API")).toBeInTheDocument();
    });

    expect(screen.getByText("DOWN")).toBeInTheDocument();
  });

  it("shows error state when fetch fails", async () => {
    mockFetchError = true;

    render(<HealthCheck />);

    await waitFor(() => {
      expect(screen.getByText("Offline")).toBeInTheDocument();
    });

    expect(screen.getByText("Cannot reach backend")).toBeInTheDocument();
  });
});
