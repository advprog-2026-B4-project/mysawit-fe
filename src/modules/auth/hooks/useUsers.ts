import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, type UserRole, type UserDTO } from "../api/authApi";

export const userKeys = {
  all:    ["users"] as const,
  list:   (role?: UserRole) => ["users", "list", role] as const,
  detail: (id: string)      => ["users", "detail", id] as const,
  buruh:  (mandorId: string) => ["users", "buruh", mandorId] as const,
};

export function useUsers(roleFilter?: UserRole) {
  return useQuery({
    queryKey: userKeys.list(roleFilter),
    queryFn:  () => authApi.listUsers(roleFilter),
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn:  () => authApi.getUserById(userId),
    enabled:  !!userId,
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
      payload: Partial<Pick<UserDTO, "name" | "role" | "email">>;
    }) => authApi.editUser(userId, payload),
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => authApi.deleteUser(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
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
    },
  });
}