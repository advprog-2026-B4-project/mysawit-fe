import { useQuery } from "@tanstack/react-query";
import { createMutation } from "@/lib/api/mutations";
import { panenApi, PanenDTO, GetPanenMandorParams, GetPanenByBuruhParams, ReviewPanenRequestDTO, GetPanenAdminParams } from "../api/panenApi";
export type { PanenDTO, GetPanenMandorParams, GetPanenByBuruhParams, ReviewPanenRequestDTO, GetPanenAdminParams } from "../api/panenApi";

export const usePanenMandor = (filters?: GetPanenMandorParams) => {
  return useQuery<PanenDTO[], Error>({
    queryKey: ["panen", "mandor", filters],
    queryFn: () => panenApi.getPanenMandor(filters),
  });
};

export const usePanenByBuruh = (buruhId: string, filters?: GetPanenByBuruhParams) => {
  return useQuery<PanenDTO[], Error>({
    queryKey: ["panen", "buruh", buruhId, filters],
    queryFn: () => panenApi.getPanenByBuruhId(buruhId, filters),
    enabled: !!buruhId,
  });
};

export const useReviewPanen = () => {
  return createMutation<PanenDTO, { panenId: string; data: ReviewPanenRequestDTO }>({
    mutationFn: ({ panenId, data }) => panenApi.reviewPanen(panenId, data),
    invalidateKeys: ["panen"],
    successMessage: "Status panen berhasil diperbarui.",
    errorMessage: "Gagal memperbarui status panen.",
  });
};

export function usePanenAdmin(params?: GetPanenAdminParams) {
  return useQuery({
    queryKey: ["panen", "admin", params],
    queryFn: () => panenApi.getPanenAdmin(params),
    staleTime: 1000 * 60 * 5,
  });
}
