import { useMutation, useQueryClient } from '@tanstack/react-query';
import { panenApi, CreatePanenRequestDTO, PanenDTO } from '../api/panenApi';

export const useCreatePanen = () => {
  const queryClient = useQueryClient();

  return useMutation<PanenDTO, Error, CreatePanenRequestDTO>({
    mutationFn: (data) => panenApi.createPanen(data),
    onSuccess: () => {
      // Invalidate cache list panen agar data terbaru langsung muncul
      // jika ada query ['panen', 'list'] yang sedang aktif
      queryClient.invalidateQueries({ queryKey: ['panen'] });
    },
  });
};