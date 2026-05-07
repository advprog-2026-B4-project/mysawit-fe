import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { extractErrorMessage, notify } from "@/lib/toast";
import { authApi, type UserRole, type UserDTO } from "../api/authApi";

export const userKeys = {
  all:    ["users"] as const,
  list:   (role?: UserRole, search?: string) => ["users", "list", role, search] as const,
  detail: (id: string)      => ["users", "detail", id] as const,
  me:     ()                => ["users", "me"] as const,
  buruh:  (mandorId: string) => ["users", "buruh", mandorId] as const,
};

export function useUsers(roleFilter?: UserRole, search?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: userKeys.list(roleFilter, search),
    queryFn:  () => authApi.listUsers(roleFilter, search),
    ...options, 
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn:  () => authApi.getUserById(userId),
    enabled:  !!userId,
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn:  () => authApi.getCurrentUser(),
  });
}

export function useBuruhByMandor(mandorId: string) {
  return useQuery({
    queryKey: userKeys.buruh(mandorId),
    queryFn:  () => authApi.getBuruhByMandorId(mandorId),
    enabled:  !!mandorId,
  });
}

export function useEditUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, payload }: {
      userId: string;
      payload: Partial<Pick<UserDTO, "name" | "role" | "email" | "mandorCertificationNumber">>;
    }) => authApi.editUser(userId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      notify.success("Profil pengguna berhasil diperbarui.");
    },
    onError: (error: unknown) => {
      notify.error(extractErrorMessage(error, "Gagal memperbarui pengguna."));
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => authApi.deleteUser(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      notify.success("Pengguna berhasil dihapus.");
    },
    onError: (error: unknown) => {
      notify.error(extractErrorMessage(error, "Gagal menghapus pengguna."));
    },
  });
}

export function useAssignBuruh() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ buruhId, mandorId }: { buruhId: string; mandorId: string }) =>
      authApi.assignBuruhToMandor(buruhId, mandorId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      notify.success("Buruh berhasil ditugaskan ke mandor.");
    },
    onError: (error: unknown) => {
      notify.error(extractErrorMessage(error, "Gagal menugaskan buruh."));
    },
  });
}