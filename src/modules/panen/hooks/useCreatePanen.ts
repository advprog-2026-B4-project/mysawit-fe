import { useMutation, useQueryClient } from '@tanstack/react-query';
import { panenApi, CreatePanenRequestDTO, PanenDTO } from '../api/panenApi';
import { extractErrorMessage, notify } from '@/lib/toast';

export const useCreatePanen = () => {
  const queryClient = useQueryClient();

  return useMutation<PanenDTO, Error, CreatePanenRequestDTO>({
    mutationFn: (data) => panenApi.createPanen(data),
    onSuccess: () => {
      // Invalidate cache list panen agar data terbaru langsung muncul
      // jika ada query ['panen', 'list'] yang sedang aktif
      queryClient.invalidateQueries({ queryKey: ['panen'] });
      notify.success('Laporan panen berhasil dicatat.');
    },
    onError: (error: unknown) => {
      notify.error(extractErrorMessage(error, 'Gagal mencatat laporan panen.'));
    },
  });
};