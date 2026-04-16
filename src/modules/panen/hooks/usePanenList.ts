import { useQuery } from '@tanstack/react-query';
import { panenApi, PanenDTO, GetPanenMandorParams, GetPanenByBuruhParams } from '../api/panenApi';

export const usePanenMandor = (filters?: GetPanenMandorParams) => {
  return useQuery<PanenDTO[], Error>({
    queryKey: ['panen', 'mandor', filters],
    queryFn: () => panenApi.getPanenMandor(filters),
  });
};

// Hook baru untuk mandor lihat panen dari profil buruh
export const usePanenByBuruh = (buruhId: string, filters?: GetPanenByBuruhParams) => {
  return useQuery<PanenDTO[], Error>({
    queryKey: ['panen', 'buruh', buruhId, filters],
    queryFn: () => panenApi.getPanenByBuruhId(buruhId, filters),
    enabled: !!buruhId, 
  });
};