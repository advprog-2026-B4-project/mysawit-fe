// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

const {
  mockGetPanenById,
  mockGetPanenByBuruhId,
} = vi.hoisted(() => ({
  mockGetPanenById: vi.fn(),
  mockGetPanenByBuruhId: vi.fn(),
}));

let mockQueryData: unknown = undefined;
let mockQueryIsLoading = false;

vi.mock("@tanstack/react-query", () => ({
  useQuery: ({ enabled }: { enabled?: boolean }) => {
    if (enabled === false) return { data: undefined, isLoading: false };
    return { data: mockQueryData, isLoading: mockQueryIsLoading };
  },
}));

vi.mock("../api/panenApi", () => ({
  panenApi: {
    getPanenById: mockGetPanenById,
    getPanenByBuruhId: mockGetPanenByBuruhId,
  },
}));

import { usePanenDetail, usePanenByBuruh } from "./usePanen";

afterEach(() => {
  vi.clearAllMocks();
  mockQueryData = undefined;
  mockQueryIsLoading = false;
});

describe("usePanenDetail", () => {
  it("returns panen detail", () => {
    mockQueryData = { panenId: "p1", berat: 500 };
    const result = usePanenDetail("p1");
    expect(result.data).toEqual({ panenId: "p1", berat: 500 });
  });

  it("returns loading state", () => {
    mockQueryIsLoading = true;
    expect(usePanenDetail("p1").isLoading).toBe(true);
  });
});

describe("usePanenByBuruh", () => {
  it("returns panen list by buruh", () => {
    mockQueryData = [{ panenId: "p1" }, { panenId: "p2" }];
    const result = usePanenByBuruh("buruh-1");
    expect(result.data).toHaveLength(2);
  });

  it("accepts optional params", () => {
    mockQueryData = [];
    const result = usePanenByBuruh("buruh-1", { startDate: "2026-01-01" });
    expect(result.data).toEqual([]);
  });
});
