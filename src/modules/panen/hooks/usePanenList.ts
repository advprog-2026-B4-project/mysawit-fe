import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { panenApi, PanenDTO, GetPanenMandorParams, GetPanenByBuruhParams, ReviewPanenRequestDTO, GetPanenAdminParams, CreatePanenRequestDTO } from '../api/panenApi';
import { extractErrorMessage, notify } from '@/lib/toast';
export type { PanenDTO, GetPanenMandorParams, GetPanenByBuruhParams, ReviewPanenRequestDTO, GetPanenAdminParams, CreatePanenRequestDTO } from '../api/panenApi';

export const usePanenMandor = (filters?: GetPanenMandorParams) => {
  return useQuery<PanenDTO[], Error>({
    queryKey: ['panen', 'mandor', filters],
    queryFn: () => panenApi.getPanenMandor(filters),
  });
};

export const usePanenByBuruh = (buruhId: string, filters?: GetPanenByBuruhParams) => {
  return useQuery<PanenDTO[], Error>({
    queryKey: ['panen', 'buruh', buruhId, filters],
    queryFn: () => panenApi.getPanenByBuruhId(buruhId, filters),
    enabled: !!buruhId, 
  });
};

export const useReviewPanen = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ panenId, data }: { panenId: string; data: ReviewPanenRequestDTO}) =>
      panenApi.reviewPanen(panenId, data),
    onSuccess: () => {
      // Invalidate semua query panen supaya list otomatis refresh
      queryClient.invalidateQueries({ queryKey: ['panen'] });
      notify.success('Status panen berhasil diperbarui.');
    },
    onError: (error: unknown) => {
      notify.error(extractErrorMessage(error, 'Gagal memperbarui status panen.'));
    },
  });
};

export function usePanenAdmin(params?: GetPanenAdminParams) {
  return useQuery({
    // Masukkan params ke dalam queryKey agar otomatis fetch ulang saat filter berubah
    queryKey: ['panen', 'admin', params],
    queryFn: () => panenApi.getPanenAdmin(params),
    // Optional: atur staleTime jika data tidak perlu di-fetch tiap detik
    staleTime: 1000 * 60 * 5, // 5 menit
  });
};