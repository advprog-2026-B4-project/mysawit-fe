import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
    buruh: (kebunId: string, searchNama?: string) =>
        ["kebun", "buruh", kebunId, searchNama ?? ""] as const,
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

export function useKebunBuruhList(kebunId: string, searchNama?: string) {
    return useQuery({
        queryKey: kebunKeys.buruh(kebunId, searchNama),
        queryFn: () => kebunApi.getBuruhList(kebunId, searchNama),
        enabled: !!kebunId,
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
        },
    });
}

export function useDeleteKebun() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (kebunId: string) => kebunApi.deleteKebun(kebunId),
        onSuccess: () => {
            invalidateKebunQueries(queryClient);
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
        },
    });
}