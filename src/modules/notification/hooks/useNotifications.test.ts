// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

const {
  mockListNotifications,
  mockMarkAsRead,
  mockMarkAllAsRead,
  mockInvalidateQueries,
} = vi.hoisted(() => ({
  mockListNotifications: vi.fn(),
  mockMarkAsRead: vi.fn(),
  mockMarkAllAsRead: vi.fn(),
  mockInvalidateQueries: vi.fn(),
}));

let mockQueryData: unknown = undefined;
let mockQueryIsLoading = false;
let mockQueryIsError = false;

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({
    data: mockQueryData,
    isLoading: mockQueryIsLoading,
    isError: mockQueryIsError,
  }),
  useMutation: ({ mutationFn, onSuccess }: { mutationFn: (...args: unknown[]) => Promise<unknown>; onSuccess?: () => void }) => {
    const fn = mutationFn === mockMarkAsRead ? mockMarkAsRead : mockMarkAllAsRead;
    return {
      mutate: fn,
      isPending: false,
      onSuccess,
    };
  },
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

vi.mock("../api/notificationApi", () => ({
  notificationApi: {
    listNotifications: mockListNotifications,
    markAsRead: mockMarkAsRead,
    markAllAsRead: mockMarkAllAsRead,
  },
}));

import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
} from "./useNotifications";

afterEach(() => {
  vi.clearAllMocks();
  mockQueryData = undefined;
  mockQueryIsLoading = false;
  mockQueryIsError = false;
});

describe("useNotifications", () => {
  it("returns query data", () => {
    mockQueryData = [{ notificationId: "1", title: "Test" }];

    const result = useNotifications();

    expect(result.data).toEqual([{ notificationId: "1", title: "Test" }]);
    expect(result.isLoading).toBe(false);
    expect(result.isError).toBe(false);
  });

  it("returns loading state", () => {
    mockQueryIsLoading = true;

    const result = useNotifications();

    expect(result.isLoading).toBe(true);
  });

  it("returns error state", () => {
    mockQueryIsError = true;

    const result = useNotifications();

    expect(result.isError).toBe(true);
  });
});

describe("useMarkAsRead", () => {
  it("returns mutation function", () => {
    const result = useMarkAsRead();

    expect(result.mutate).toBe(mockMarkAsRead);
    expect(result.isPending).toBe(false);
  });
});

describe("useMarkAllAsRead", () => {
  it("returns mutation function", () => {
    const result = useMarkAllAsRead();

    expect(result.mutate).toBe(mockMarkAllAsRead);
    expect(result.isPending).toBe(false);
  });
});
