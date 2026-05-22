import { useQuery } from "@tanstack/react-query";
import { useCreateMutation } from "@/lib/api/mutations";
import { useAuth } from "@/modules/auth";
import { pembayaranApi, type VariabelPokokDTO, type VariableKey } from "../api/pembayaranApi";

export const variabelPokokKeys = {
  all: ["variabel-pokok"] as const,
  one: (key: VariableKey) => ["variabel-pokok", key] as const,
} as const;

export function useVariabelPokokList() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: variabelPokokKeys.all,
    queryFn: pembayaranApi.getAllVariabelPokok,
    enabled: isAuthenticated(),
  });
}

export function useVariabelPokok(key: VariableKey) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: variabelPokokKeys.one(key),
    queryFn: () => pembayaranApi.getVariabelPokok(key),
    enabled: isAuthenticated(),
  });
}

interface UpdateVariables {
  key: VariableKey;
  newValue: number;
}

export function useUpdateVariabelPokok() {
  return useCreateMutation<VariabelPokokDTO, UpdateVariables>({
    mutationFn: ({ key, newValue }) => pembayaranApi.updateVariabelPokok(key, newValue),
    invalidateKeys: variabelPokokKeys.all,
    successMessage: (updated) => `Variabel ${updated.key} berhasil diperbarui.`,
    errorMessage: "Gagal memperbarui variabel pokok.",
    onSuccess: (updated, queryClient) => {
      queryClient.setQueryData(variabelPokokKeys.one(updated.key), updated);
    },
  });
}
