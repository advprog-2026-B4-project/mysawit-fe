// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
    kebunKeys,
    useAssignMandorToKebun,
    useAssignSupirToKebun,
    useCreateKebun,
    useDeleteKebun,
    useEditKebun,
    useKebunBuruhList,
    useKebunDetail,
    useKebunDirectoryUsers,
    useKebunList,
    useKebunMandor,
    useKebunSupirList,
    useKebunUser,
    useMoveMandorToKebun,
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
        expect(kebunKeys.list()).toEqual(["kebun", "list", "", ""]);
        expect(kebunKeys.list("Sei", "KB-01")).toEqual(["kebun", "list", "Sei", "KB-01"]);
        expect(kebunKeys.detail("kebun-1")).toEqual(["kebun", "detail", "kebun-1"]);
        expect(kebunKeys.mandor("kebun-1")).toEqual(["kebun", "mandor", "kebun-1"]);
        expect(kebunKeys.supir("kebun-1", "Supir")).toEqual(["kebun", "supir", "kebun-1", "Supir"]);
        expect(kebunKeys.buruh("kebun-1", "Buruh", "mandor-1")).toEqual([
            "kebun",
            "buruh",
            "kebun-1",
            "Buruh",
            "mandor-1",
        ]);
        expect(kebunKeys.usersByRole("MANDOR")).toEqual(["kebun", "users-by-role", "MANDOR"]);
        expect(kebunKeys.user("mandor-1")).toEqual(["kebun", "user", "mandor-1"]);
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

    it("fetches every kebun detail relation query", async () => {
        const user = {
            userId: "mandor-1",
            username: "mandor1",
            name: "Mandor Satu",
            role: "MANDOR",
            email: "mandor@test.com",
        };
        mockKebunApi.getKebunById.mockResolvedValue(kebun);
        mockKebunApi.getMandorByKebun.mockResolvedValue({ mandorId: "mandor-1" });
        mockKebunApi.getSupirList.mockResolvedValue([user]);
        mockKebunApi.getBuruhList.mockResolvedValue([user]);
        mockKebunApi.listUsersByRole.mockResolvedValue([user]);
        mockKebunApi.getUserById.mockResolvedValue(user);
        const { Wrapper } = createWrapper();

        const detail = renderHook(() => useKebunDetail("kebun-1"), { wrapper: Wrapper });
        const mandor = renderHook(() => useKebunMandor("kebun-1"), { wrapper: Wrapper });
        const supir = renderHook(() => useKebunSupirList("kebun-1", "Supir"), { wrapper: Wrapper });
        const buruh = renderHook(() => useKebunBuruhList("kebun-1", "Buruh", "mandor-1"), { wrapper: Wrapper });
        const users = renderHook(() => useKebunDirectoryUsers("MANDOR"), { wrapper: Wrapper });
        const userDetail = renderHook(() => useKebunUser("mandor-1"), { wrapper: Wrapper });

        await waitFor(() => {
            expect(detail.result.current.isSuccess).toBe(true);
            expect(mandor.result.current.isSuccess).toBe(true);
            expect(supir.result.current.isSuccess).toBe(true);
            expect(buruh.result.current.isSuccess).toBe(true);
            expect(users.result.current.isSuccess).toBe(true);
            expect(userDetail.result.current.isSuccess).toBe(true);
        });

        expect(mockKebunApi.getKebunById).toHaveBeenCalledWith("kebun-1");
        expect(mockKebunApi.getMandorByKebun).toHaveBeenCalledWith("kebun-1");
        expect(mockKebunApi.getSupirList).toHaveBeenCalledWith("kebun-1", "Supir");
        expect(mockKebunApi.getBuruhList).toHaveBeenCalledWith("kebun-1", "Buruh");
        expect(mockKebunApi.listUsersByRole).toHaveBeenCalledWith("MANDOR");
        expect(mockKebunApi.getUserById).toHaveBeenCalledWith("mandor-1");
    });

    it("keeps disabled relation queries idle without required ids", () => {
        const { Wrapper } = createWrapper();

        const mandor = renderHook(() => useKebunMandor(""), { wrapper: Wrapper });
        const supir = renderHook(() => useKebunSupirList(""), { wrapper: Wrapper });
        const buruh = renderHook(() => useKebunBuruhList("", undefined, null), { wrapper: Wrapper });
        const user = renderHook(() => useKebunUser(""), { wrapper: Wrapper });

        expect(mandor.result.current.fetchStatus).toBe("idle");
        expect(supir.result.current.fetchStatus).toBe("idle");
        expect(buruh.result.current.fetchStatus).toBe("idle");
        expect(user.result.current.fetchStatus).toBe("idle");
        expect(mockKebunApi.getMandorByKebun).not.toHaveBeenCalled();
        expect(mockKebunApi.getSupirList).not.toHaveBeenCalled();
        expect(mockKebunApi.getBuruhList).not.toHaveBeenCalled();
        expect(mockKebunApi.getUserById).not.toHaveBeenCalled();
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

    it("runs all kebun mutations successfully", async () => {
        mockKebunApi.editKebun.mockResolvedValue(kebun);
        mockKebunApi.deleteKebun.mockResolvedValue(undefined);
        mockKebunApi.assignMandorToKebun.mockResolvedValue(undefined);
        mockKebunApi.moveMandorToKebun.mockResolvedValue(undefined);
        mockKebunApi.assignSupirToKebun.mockResolvedValue(undefined);
        mockKebunApi.moveSupirToKebun.mockResolvedValue(undefined);
        const { Wrapper, queryClient } = createWrapper();
        const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

        const edit = renderHook(() => useEditKebun(), { wrapper: Wrapper });
        const deleteKebun = renderHook(() => useDeleteKebun(), { wrapper: Wrapper });
        const assignMandor = renderHook(() => useAssignMandorToKebun(), { wrapper: Wrapper });
        const moveMandor = renderHook(() => useMoveMandorToKebun(), { wrapper: Wrapper });
        const assignSupir = renderHook(() => useAssignSupirToKebun(), { wrapper: Wrapper });
        const moveSupir = renderHook(() => useMoveSupirToKebun(), { wrapper: Wrapper });

        await act(async () => {
            await edit.result.current.mutateAsync({
                kebunId: "kebun-1",
                payload: {
                    nama: "Kebun Edit",
                    luas: 25,
                    coordinates: kebun.coordinates,
                },
            });
            await deleteKebun.result.current.mutateAsync("kebun-1");
            await assignMandor.result.current.mutateAsync({ mandorId: "mandor-1", kebunId: "kebun-1" });
            await moveMandor.result.current.mutateAsync({ mandorId: "mandor-1", newKebunId: "kebun-2" });
            await assignSupir.result.current.mutateAsync({ supirId: "supir-1", kebunId: "kebun-1" });
            await moveSupir.result.current.mutateAsync({ supirId: "supir-1", newKebunId: "kebun-2" });
        });

        expect(mockKebunApi.editKebun).toHaveBeenCalledWith("kebun-1", {
            nama: "Kebun Edit",
            luas: 25,
            coordinates: kebun.coordinates,
        });
        expect(mockKebunApi.deleteKebun).toHaveBeenCalledWith("kebun-1");
        expect(mockKebunApi.assignMandorToKebun).toHaveBeenCalledWith("mandor-1", "kebun-1");
        expect(mockKebunApi.moveMandorToKebun).toHaveBeenCalledWith("mandor-1", "kebun-2");
        expect(mockKebunApi.assignSupirToKebun).toHaveBeenCalledWith("supir-1", "kebun-1");
        expect(mockKebunApi.moveSupirToKebun).toHaveBeenCalledWith("supir-1", "kebun-2");
        expect(invalidateSpy).toHaveBeenCalledTimes(6);
        expect(mockNotify.success).toHaveBeenCalledWith("Perubahan kebun berhasil disimpan.");
        expect(mockNotify.success).toHaveBeenCalledWith("Kebun berhasil dihapus.");
        expect(mockNotify.success).toHaveBeenCalledWith("Mandor berhasil ditugaskan.");
        expect(mockNotify.success).toHaveBeenCalledWith("Mandor berhasil dipindahkan.");
        expect(mockNotify.success).toHaveBeenCalledWith("Supir berhasil ditugaskan.");
        expect(mockNotify.success).toHaveBeenCalledWith("Supir berhasil dipindahkan.");
    });

    it("shows fallback error toast for every mutation type", async () => {
        mockKebunApi.createKebun.mockRejectedValue("");
        mockKebunApi.editKebun.mockRejectedValue("");
        mockKebunApi.deleteKebun.mockRejectedValue("");
        mockKebunApi.assignMandorToKebun.mockRejectedValue("");
        mockKebunApi.moveMandorToKebun.mockRejectedValue("");
        mockKebunApi.assignSupirToKebun.mockRejectedValue("");
        const { Wrapper } = createWrapper();

        const create = renderHook(() => useCreateKebun(), { wrapper: Wrapper });
        const edit = renderHook(() => useEditKebun(), { wrapper: Wrapper });
        const deleteKebun = renderHook(() => useDeleteKebun(), { wrapper: Wrapper });
        const assignMandor = renderHook(() => useAssignMandorToKebun(), { wrapper: Wrapper });
        const moveMandor = renderHook(() => useMoveMandorToKebun(), { wrapper: Wrapper });
        const assignSupir = renderHook(() => useAssignSupirToKebun(), { wrapper: Wrapper });

        await act(async () => {
            await expect(
                create.result.current.mutateAsync({
                    nama: "Kebun Baru",
                    kode: "KB-NEW",
                    luas: 30,
                    coordinates: kebun.coordinates,
                }),
            ).rejects.toBe("");
            await expect(
                edit.result.current.mutateAsync({
                    kebunId: "kebun-1",
                    payload: {
                        nama: "Kebun Edit",
                        luas: 25,
                        coordinates: kebun.coordinates,
                    },
                }),
            ).rejects.toBe("");
            await expect(deleteKebun.result.current.mutateAsync("kebun-1")).rejects.toBe("");
            await expect(
                assignMandor.result.current.mutateAsync({ mandorId: "mandor-1", kebunId: "kebun-1" }),
            ).rejects.toBe("");
            await expect(
                moveMandor.result.current.mutateAsync({ mandorId: "mandor-1", newKebunId: "kebun-2" }),
            ).rejects.toBe("");
            await expect(
                assignSupir.result.current.mutateAsync({ supirId: "supir-1", kebunId: "kebun-1" }),
            ).rejects.toBe("");
        });

        expect(mockNotify.error).toHaveBeenCalledWith("Gagal membuat kebun.");
        expect(mockNotify.error).toHaveBeenCalledWith("Gagal memperbarui kebun.");
        expect(mockNotify.error).toHaveBeenCalledWith("Gagal menghapus kebun.");
        expect(mockNotify.error).toHaveBeenCalledWith("Gagal menugaskan mandor.");
        expect(mockNotify.error).toHaveBeenCalledWith("Gagal memindahkan mandor.");
        expect(mockNotify.error).toHaveBeenCalledWith("Gagal menugaskan supir.");
    });
});
