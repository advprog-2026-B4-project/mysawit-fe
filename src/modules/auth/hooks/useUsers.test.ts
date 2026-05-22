// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

const {
  mockListUsers,
  mockGetUserById,
  mockGetCurrentUser,
  mockGetBuruhByMandorId,
  mockEditUser,
  mockDeleteUser,
  mockAssignBuruhToMandor,
  mockInvalidateQueries,
} = vi.hoisted(() => ({
  mockListUsers: vi.fn(),
  mockGetUserById: vi.fn(),
  mockGetCurrentUser: vi.fn(),
  mockGetBuruhByMandorId: vi.fn(),
  mockEditUser: vi.fn(),
  mockDeleteUser: vi.fn(),
  mockAssignBuruhToMandor: vi.fn(),
  mockInvalidateQueries: vi.fn(),
}));

let mockQueryData: unknown = undefined;
let mockQueryIsLoading = false;

vi.mock("@tanstack/react-query", () => ({
  useQuery: ({ enabled }: { enabled?: boolean }) => {
    if (enabled === false) return { data: undefined, isLoading: false };
    return { data: mockQueryData, isLoading: mockQueryIsLoading };
  },
  useMutation: ({ mutationFn }: { mutationFn: (...args: unknown[]) => Promise<unknown> }) => ({
    mutate: mutationFn,
    isPending: false,
  }),
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));

vi.mock("@/lib/toast", () => ({
  notify: { success: vi.fn(), error: vi.fn() },
  extractErrorMessage: (e: unknown) => String(e),
}));

vi.mock("../api/authApi", () => ({
  authApi: {
    listUsers: mockListUsers,
    getUserById: mockGetUserById,
    getCurrentUser: mockGetCurrentUser,
    getBuruhByMandorId: mockGetBuruhByMandorId,
    editUser: mockEditUser,
    deleteUser: mockDeleteUser,
    assignBuruhToMandor: mockAssignBuruhToMandor,
  },
}));

import {
  useUsers,
  useUser,
  useCurrentUser,
  useBuruhByMandor,
  useEditUser,
  useDeleteUser,
  useAssignBuruh,
} from "./useUsers";

afterEach(() => {
  vi.clearAllMocks();
  mockQueryData = undefined;
  mockQueryIsLoading = false;
});

describe("useUsers", () => {
  it("returns users list", () => {
    mockQueryData = [{ id: "1", name: "User A" }];
    const result = useUsers();
    expect(result.data).toEqual([{ id: "1", name: "User A" }]);
  });

  it("returns loading state", () => {
    mockQueryIsLoading = true;
    expect(useUsers().isLoading).toBe(true);
  });
});

describe("useUser", () => {
  it("returns user detail", () => {
    mockQueryData = { id: "1", name: "User A" };
    const result = useUser("1");
    expect(result.data).toEqual({ id: "1", name: "User A" });
  });
});

describe("useCurrentUser", () => {
  it("returns current user", () => {
    mockQueryData = { id: "me", name: "Current User", role: "ADMIN" };
    const result = useCurrentUser();
    expect(result.data).toEqual({ id: "me", name: "Current User", role: "ADMIN" });
  });
});

describe("useBuruhByMandor", () => {
  it("returns buruh list", () => {
    mockQueryData = [{ id: "b1", name: "Buruh A" }];
    const result = useBuruhByMandor("mandor-1");
    expect(result.data).toEqual([{ id: "b1", name: "Buruh A" }]);
  });
});

describe("useEditUser", () => {
  it("returns mutate function", () => {
    const { mutate } = useEditUser();
    expect(typeof mutate).toBe("function");
  });
});

describe("useDeleteUser", () => {
  it("returns mutate function", () => {
    const { mutate } = useDeleteUser();
    expect(typeof mutate).toBe("function");
  });
});

describe("useAssignBuruh", () => {
  it("returns mutate function", () => {
    const { mutate } = useAssignBuruh();
    expect(typeof mutate).toBe("function");
  });
});
