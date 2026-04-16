import { useMutation, useQueryClient } from '@tanstack/react-query';
import { panenApi, CreatePanenRequestDTO, PanenDTO } from '../api/panenApi';
import { extractErrorMessage, notify } from '@/lib/toast';

export const useCreatePanen = () => {
  const queryClient = useQueryClient();

  return useMutation<PanenDTO, Error, CreatePanenRequestDTO>({
    mutationFn: (data) => panenApi.createPanen(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panen'] });
    },
    onError: (error: unknown) => {
      notify.error(extractErrorMessage(error, 'Gagal mencatat laporan panen.'));
    },
  });
};