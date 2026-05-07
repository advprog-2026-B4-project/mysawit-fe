import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { extractErrorMessage, notify } from "@/lib/toast";
import {
    kebunApi,
    type CreateKebunRequest,
    type EditKebunRequest,
    type KebunUserRole,
} from "../api/kebunApi";

export const kebunKeys = {
    all: ["kebun"] as const,
    list: (searchNama?: string, searchKode?: string) =>
        ["kebun", "list", searchNama ?? "", searchKode ?? ""] as const,
    detail: (kebunId: string) => ["kebun", "detail", kebunId] as const,
    mandor: (kebunId: string) => ["kebun", "mandor", kebunId] as const,
    supir: (kebunId: string, searchNama?: string) =>
        ["kebun", "supir", kebunId, searchNama ?? ""] as const,
    buruh: (kebunId: string, searchNama?: string, mandorId?: string | null) =>
        ["kebun", "buruh", kebunId, searchNama ?? "", mandorId ?? ""] as const,
    usersByRole: (role: Extract<KebunUserRole, "MANDOR" | "SUPIR">) =>
        ["kebun", "users-by-role", role] as const,
    user: (userId: string) => ["kebun", "user", userId] as const,
};

export function useKebunList(searchNama?: string, searchKode?: string) {
    return useQuery({
        queryKey: kebunKeys.list(searchNama, searchKode),
        queryFn: () => kebunApi.listKebun(searchNama, searchKode),
    });
}

export function useKebunDetail(kebunId: string) {
    return useQuery({
        queryKey: kebunKeys.detail(kebunId),
        queryFn: () => kebunApi.getKebunById(kebunId),
        enabled: !!kebunId,
    });
}

export function useKebunMandor(kebunId: string) {
    return useQuery({
        queryKey: kebunKeys.mandor(kebunId),
        queryFn: () => kebunApi.getMandorByKebun(kebunId),
        enabled: !!kebunId,
    });
}

export function useKebunSupirList(kebunId: string, searchNama?: string) {
    return useQuery({
        queryKey: kebunKeys.supir(kebunId, searchNama),
        queryFn: () => kebunApi.getSupirList(kebunId, searchNama),
        enabled: !!kebunId,
    });
}

export function useKebunBuruhList(kebunId: string, searchNama?: string, mandorId?: string | null) {
    return useQuery({
        queryKey: kebunKeys.buruh(kebunId, searchNama, mandorId),
        queryFn: () => kebunApi.getBuruhList(kebunId, searchNama),
        enabled: !!kebunId,
        refetchOnMount: "always",
    });
}

export function useKebunDirectoryUsers(role: Extract<KebunUserRole, "MANDOR" | "SUPIR">) {
    return useQuery({
        queryKey: kebunKeys.usersByRole(role),
        queryFn: () => kebunApi.listUsersByRole(role),
    });
}

export function useKebunUser(userId: string) {
    return useQuery({
        queryKey: kebunKeys.user(userId),
        queryFn: () => kebunApi.getUserById(userId),
        enabled: !!userId,
    });
}

function invalidateKebunQueries(queryClient: ReturnType<typeof useQueryClient>) {
    queryClient.invalidateQueries({ queryKey: kebunKeys.all });
}

export function useCreateKebun() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateKebunRequest) => kebunApi.createKebun(payload),
        onSuccess: () => {
            invalidateKebunQueries(queryClient);
            notify.success("Kebun berhasil dibuat.");
        },
        onError: (error: unknown) => {
            notify.error(extractErrorMessage(error, "Gagal membuat kebun."));
        },
    });
}

export function useEditKebun() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ kebunId, payload }: { kebunId: string; payload: EditKebunRequest }) =>
            kebunApi.editKebun(kebunId, payload),
        onSuccess: () => {
            invalidateKebunQueries(queryClient);
            notify.success("Perubahan kebun berhasil disimpan.");
        },
        onError: (error: unknown) => {
            notify.error(extractErrorMessage(error, "Gagal memperbarui kebun."));
        },
    });
}

export function useDeleteKebun() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (kebunId: string) => kebunApi.deleteKebun(kebunId),
        onSuccess: () => {
            invalidateKebunQueries(queryClient);
            notify.success("Kebun berhasil dihapus.");
        },
        onError: (error: unknown) => {
            notify.error(extractErrorMessage(error, "Gagal menghapus kebun."));
        },
    });
}

export function useAssignMandorToKebun() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ mandorId, kebunId }: { mandorId: string; kebunId: string }) =>
            kebunApi.assignMandorToKebun(mandorId, kebunId),
        onSuccess: () => {
            invalidateKebunQueries(queryClient);
            notify.success("Mandor berhasil ditugaskan.");
        },
        onError: (error: unknown) => {
            notify.error(extractErrorMessage(error, "Gagal menugaskan mandor."));
        },
    });
}

export function useMoveMandorToKebun() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ mandorId, newKebunId }: { mandorId: string; newKebunId: string }) =>
            kebunApi.moveMandorToKebun(mandorId, newKebunId),
        onSuccess: () => {
            invalidateKebunQueries(queryClient);
            notify.success("Mandor berhasil dipindahkan.");
        },
        onError: (error: unknown) => {
            notify.error(extractErrorMessage(error, "Gagal memindahkan mandor."));
        },
    });
}

export function useAssignSupirToKebun() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ supirId, kebunId }: { supirId: string; kebunId: string }) =>
            kebunApi.assignSupirToKebun(supirId, kebunId),
        onSuccess: () => {
            invalidateKebunQueries(queryClient);
            notify.success("Supir berhasil ditugaskan.");
        },
        onError: (error: unknown) => {
            notify.error(extractErrorMessage(error, "Gagal menugaskan supir."));
        },
    });
}

export function useMoveSupirToKebun() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ supirId, newKebunId }: { supirId: string; newKebunId: string }) =>
            kebunApi.moveSupirToKebun(supirId, newKebunId),
        onSuccess: () => {
            invalidateKebunQueries(queryClient);
            notify.success("Supir berhasil dipindahkan.");
        },
        onError: (error: unknown) => {
            notify.error(extractErrorMessage(error, "Gagal memindahkan supir."));
        },
    });
}
