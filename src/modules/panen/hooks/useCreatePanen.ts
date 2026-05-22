import { useCreateMutation } from "@/lib/api/mutations";
import { panenApi, CreatePanenRequestDTO, PanenDTO } from "../api/panenApi";

export const useCreatePanen = () => {
  return useCreateMutation<PanenDTO, CreatePanenRequestDTO>({
    mutationFn: (data) => panenApi.createPanen(data),
    invalidateKeys: ["panen"],
    errorMessage: "Gagal mencatat laporan panen.",
  });
};
