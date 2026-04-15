import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth";
import { pembayaranApi, type VariabelPokokDTO, type VariableKey } from "../api/pembayaranApi";
import { extractErrorMessage, notify } from "@/lib/toast";

// Query keys - centralised to ensure consistent cache invalidation
export const variabelPokokKeys = {
  all: ["variabel-pokok"] as const,
  one: (key: VariableKey) => ["variabel-pokok", key] as const,
} as const;

// Queries

/** Returns all three wage variables. Only runs when the user is authenticated. */
export function useVariabelPokokList() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: variabelPokokKeys.all,
    queryFn:  pembayaranApi.getAllVariabelPokok,
    enabled:  isAuthenticated(),
  });
}

/** Returns a single wage variable by key. Only runs when the user is authenticated. */
export function useVariabelPokok(key: VariableKey) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: variabelPokokKeys.one(key),
    queryFn:  () => pembayaranApi.getVariabelPokok(key),
    enabled:  isAuthenticated(),
  });
}

// Mutations

interface UpdateVariables {
  key:      VariableKey;
  newValue: number;
}

/**
 * Mutation to update a single wage variable.
 * On success: invalidates the list cache and the individual item cache.
 */
export function useUpdateVariabelPokok() {
  const queryClient = useQueryClient();

  return useMutation<VariabelPokokDTO, Error, UpdateVariables>({
    mutationFn: ({ key, newValue }) =>
      pembayaranApi.updateVariabelPokok(key, newValue),

    onSuccess: (updated) => {
      // Optimistically update the individual item cache
      queryClient.setQueryData(variabelPokokKeys.one(updated.key), updated);
      // Invalidate the list so it re-fetches fresh data
      queryClient.invalidateQueries({ queryKey: variabelPokokKeys.all });
      notify.success(`Variabel ${updated.key} berhasil diperbarui.`);
    },

    onError: (error: unknown) => {
      notify.error(extractErrorMessage(error, "Gagal memperbarui variabel pokok."));
    },
  });
}
