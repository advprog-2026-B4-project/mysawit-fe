import { useQuery } from '@tanstack/react-query';
import { panenApi, PanenDTO, GetPanenMandorParams } from '../api/panenApi';

export const usePanenMandor = (filters?: GetPanenMandorParams) => {
  return useQuery<PanenDTO[], Error>({
    // queryKey menyertakan filters — otomatis re-fetch saat filter berubah
    queryKey: ['panen', 'mandor', filters],
    queryFn: () => panenApi.getPanenMandor(filters),
  });
};