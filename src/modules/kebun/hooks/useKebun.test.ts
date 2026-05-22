// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

const {
  mockListKebun,
  mockGetKebunById,
  mockGetMandorByKebun,
  mockGetSupirList,
  mockGetBuruhList,
  mockListUsersByRole,
  mockGetUserById,
  mockCreateKebun,
  mockEditKebun,
  mockDeleteKebun,
  mockInvalidateQueries,
} = vi.hoisted(() => ({
  mockListKebun: vi.fn(),
  mockGetKebunById: vi.fn(),
  mockGetMandorByKebun: vi.fn(),
  mockGetSupirList: vi.fn(),
  mockGetBuruhList: vi.fn(),
  mockListUsersByRole: vi.fn(),
  mockGetUserById: vi.fn(),
  mockCreateKebun: vi.fn(),
  mockEditKebun: vi.fn(),
  mockDeleteKebun: vi.fn(),
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

vi.mock("../api/kebunApi", () => ({
  kebunApi: {
    listKebun: mockListKebun,
    getKebunById: mockGetKebunById,
    getMandorByKebun: mockGetMandorByKebun,
    getSupirList: mockGetSupirList,
    getBuruhList: mockGetBuruhList,
    listUsersByRole: mockListUsersByRole,
    getUserById: mockGetUserById,
    createKebun: mockCreateKebun,
    editKebun: mockEditKebun,
    deleteKebun: mockDeleteKebun,
    assignMandorToKebun: vi.fn(),
    moveMandorToKebun: vi.fn(),
    assignSupirToKebun: vi.fn(),
    moveSupirToKebun: vi.fn(),
  },
}));

import {
  useKebunList,
  useKebunDetail,
  useKebunMandor,
  useKebunSupirList,
  useKebunBuruhList,
  useKebunDirectoryUsers,
  useKebunUser,
  useCreateKebun,
  useEditKebun,
  useDeleteKebun,
} from "./useKebun";

afterEach(() => {
  vi.clearAllMocks();
  mockQueryData = undefined;
  mockQueryIsLoading = false;
});

describe("useKebunList", () => {
  it("returns kebun list", () => {
    mockQueryData = [{ kebunId: "k1", nama: "Kebun A" }];
    const result = useKebunList();
    expect(result.data).toEqual([{ kebunId: "k1", nama: "Kebun A" }]);
  });

  it("returns loading state", () => {
    mockQueryIsLoading = true;
    expect(useKebunList().isLoading).toBe(true);
  });
});

describe("useKebunDetail", () => {
  it("returns kebun detail", () => {
    mockQueryData = { kebunId: "k1", nama: "Kebun A" };
    const result = useKebunDetail("k1");
    expect(result.data).toEqual({ kebunId: "k1", nama: "Kebun A" });
  });
});

describe("useKebunMandor", () => {
  it("returns mandor list", () => {
    mockQueryData = [{ userId: "m1", name: "Mandor A" }];
    const result = useKebunMandor("k1");
    expect(result.data).toEqual([{ userId: "m1", name: "Mandor A" }]);
  });
});

describe("useKebunSupirList", () => {
  it("returns supir list", () => {
    mockQueryData = [{ userId: "s1", name: "Supir A" }];
    const result = useKebunSupirList("k1");
    expect(result.data).toEqual([{ userId: "s1", name: "Supir A" }]);
  });
});

describe("useKebunBuruhList", () => {
  it("returns buruh list", () => {
    mockQueryData = [{ userId: "b1", name: "Buruh A" }];
    const result = useKebunBuruhList("k1");
    expect(result.data).toEqual([{ userId: "b1", name: "Buruh A" }]);
  });
});

describe("useKebunDirectoryUsers", () => {
  it("returns users by role", () => {
    mockQueryData = [{ userId: "m1", name: "Mandor A" }];
    const result = useKebunDirectoryUsers("MANDOR");
    expect(result.data).toEqual([{ userId: "m1", name: "Mandor A" }]);
  });
});

describe("useKebunUser", () => {
  it("returns single user", () => {
    mockQueryData = { userId: "u1", name: "User A", role: "BURUH" };
    const result = useKebunUser("u1");
    expect(result.data).toEqual({ userId: "u1", name: "User A", role: "BURUH" });
  });
});

describe("useCreateKebun", () => {
  it("returns mutate function", () => {
    const { mutate } = useCreateKebun();
    expect(typeof mutate).toBe("function");
  });
});

describe("useEditKebun", () => {
  it("returns mutate function", () => {
    const { mutate } = useEditKebun();
    expect(typeof mutate).toBe("function");
  });
});

describe("useDeleteKebun", () => {
  it("returns mutate function", () => {
    const { mutate } = useDeleteKebun();
    expect(typeof mutate).toBe("function");
  });
});
