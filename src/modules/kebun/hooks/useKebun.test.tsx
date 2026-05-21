// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
    kebunKeys,
    useCreateKebun,
    useKebunDetail,
    useKebunList,
    useMoveSupirToKebun,
} from "./useKebun";

const mockKebunApi = vi.hoisted(() => ({
    listKebun: vi.fn(),
    getKebunById: vi.fn(),
    createKebun: vi.fn(),
    editKebun: vi.fn(),
    deleteKebun: vi.fn(),
    getMandorByKebun: vi.fn(),
    getSupirList: vi.fn(),
    getBuruhList: vi.fn(),
    assignMandorToKebun: vi.fn(),
    moveMandorToKebun: vi.fn(),
    assignSupirToKebun: vi.fn(),
    moveSupirToKebun: vi.fn(),
    listUsersByRole: vi.fn(),
    getUserById: vi.fn(),
}));

const mockNotify = vi.hoisted(() => ({
    success: vi.fn(),
    error: vi.fn(),
}));

vi.mock("../api/kebunApi", () => ({
    kebunApi: mockKebunApi,
}));

vi.mock("@/lib/toast", () => ({
    notify: mockNotify,
    extractErrorMessage: (error: unknown, fallback: string) =>
        error instanceof Error && error.message ? error.message : fallback,
}));

const kebun = {
    kebunId: "kebun-1",
    nama: "Kebun Sei Lestari",
    kode: "KB-01",
    luas: 20,
    coordinates: [
        { lat: 0, lng: 0 },
        { lat: 0, lng: 10 },
        { lat: 10, lng: 0 },
        { lat: 10, lng: 10 },
    ],
};

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    function Wrapper({ children }: { children: ReactNode }) {
        return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    }

    return { Wrapper, queryClient };
}

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe("useKebun hooks", () => {
    it("builds stable query keys", () => {
        expect(kebunKeys.all).toEqual(["kebun"]);
        expect(kebunKeys.list("Sei", "KB-01")).toEqual(["kebun", "list", "Sei", "KB-01"]);
        expect(kebunKeys.detail("kebun-1")).toEqual(["kebun", "detail", "kebun-1"]);
        expect(kebunKeys.buruh("kebun-1", "Buruh", "mandor-1")).toEqual([
            "kebun",
            "buruh",
            "kebun-1",
            "Buruh",
            "mandor-1",
        ]);
    });

    it("fetches kebun list using search params", async () => {
        mockKebunApi.listKebun.mockResolvedValue([kebun]);
        const { Wrapper } = createWrapper();

        const { result } = renderHook(() => useKebunList("Sei", "KB-01"), { wrapper: Wrapper });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(mockKebunApi.listKebun).toHaveBeenCalledWith("Sei", "KB-01");
        expect(result.current.data).toEqual([kebun]);
    });

    it("does not fetch kebun detail when kebun id is empty", () => {
        const { Wrapper } = createWrapper();

        const { result } = renderHook(() => useKebunDetail(""), { wrapper: Wrapper });

        expect(result.current.fetchStatus).toBe("idle");
        expect(mockKebunApi.getKebunById).not.toHaveBeenCalled();
    });

    it("invalidates kebun queries and shows success toast after create mutation", async () => {
        mockKebunApi.createKebun.mockResolvedValue(kebun);
        const { Wrapper, queryClient } = createWrapper();
        const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

        const { result } = renderHook(() => useCreateKebun(), { wrapper: Wrapper });

        await act(async () => {
            await result.current.mutateAsync({
                nama: "Kebun Baru",
                kode: "KB-NEW",
                luas: 30,
                coordinates: kebun.coordinates,
            });
        });

        expect(mockKebunApi.createKebun).toHaveBeenCalledWith({
            nama: "Kebun Baru",
            kode: "KB-NEW",
            luas: 30,
            coordinates: kebun.coordinates,
        });
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: kebunKeys.all });
        expect(mockNotify.success).toHaveBeenCalledWith("Kebun berhasil dibuat.");
    });

    it("shows error toast when mutation fails", async () => {
        mockKebunApi.moveSupirToKebun.mockRejectedValue(new Error("Supir sudah terikat"));
        const { Wrapper } = createWrapper();

        const { result } = renderHook(() => useMoveSupirToKebun(), { wrapper: Wrapper });

        await act(async () => {
            await expect(
                result.current.mutateAsync({
                    supirId: "supir-1",
                    newKebunId: "kebun-2",
                }),
            ).rejects.toThrow("Supir sudah terikat");
        });

        expect(mockKebunApi.moveSupirToKebun).toHaveBeenCalledWith("supir-1", "kebun-2");
        expect(mockNotify.error).toHaveBeenCalledWith("Supir sudah terikat");
    });
});
