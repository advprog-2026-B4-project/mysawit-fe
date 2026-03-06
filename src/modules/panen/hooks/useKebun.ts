import { useQuery } from '@tanstack/react-query';
import { panenApi, KebunDTO } from '../api/panenApi';

export const useDaftarKebun = () => {
  return useQuery<KebunDTO[], Error>({
    queryKey: ['kebun', 'list'],
    queryFn: () => panenApi.getDaftarKebun(),
  });
};