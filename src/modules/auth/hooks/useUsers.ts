import { useQuery } from "@tanstack/react-query";
import { useCreateMutation } from "@/lib/api/mutations";
import { authApi, type UserRole, type UserDTO } from "../api/authApi";

export const userKeys = {
  all: ["users"] as const,
  list: (role?: UserRole) => ["users", "list", role] as const,
  detail: (id: string) => ["users", "detail", id] as const,
  me: () => ["users", "me"] as const,
  buruh: (mandorId: string) => ["users", "buruh", mandorId] as const,
};

export function useUsers(roleFilter?: UserRole) {
  return useQuery({
    queryKey: userKeys.list(roleFilter),
    queryFn: () => authApi.listUsers(roleFilter),
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => authApi.getUserById(userId),
    enabled: !!userId,
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: () => authApi.getCurrentUser(),
  });
}

export function useBuruhByMandor(mandorId: string) {
  return useQuery({
    queryKey: userKeys.buruh(mandorId),
    queryFn: () => authApi.getBuruhByMandorId(mandorId),
    enabled: !!mandorId,
  });
}

export function useEditUser() {
  return useCreateMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: Partial<Pick<UserDTO, "name" | "role" | "email" | "mandorCertificationNumber">>;
    }) => authApi.editUser(userId, payload),
    invalidateKeys: userKeys.all,
    successMessage: "Profil pengguna berhasil diperbarui.",
    errorMessage: "Gagal memperbarui pengguna.",
  });
}

export function useDeleteUser() {
  return useCreateMutation<void, string>({
    mutationFn: (userId) => authApi.deleteUser(userId),
    invalidateKeys: userKeys.all,
    successMessage: "Pengguna berhasil dihapus.",
    errorMessage: "Gagal menghapus pengguna.",
  });
}

export function useAssignBuruh() {
  return useCreateMutation({
    mutationFn: ({ buruhId, mandorId }: { buruhId: string; mandorId: string }) =>
      authApi.assignBuruhToMandor(buruhId, mandorId),
    invalidateKeys: [userKeys.all, ["kebun"]],
    successMessage: "Buruh berhasil ditugaskan ke mandor.",
    errorMessage: "Gagal menugaskan buruh.",
  });
}
