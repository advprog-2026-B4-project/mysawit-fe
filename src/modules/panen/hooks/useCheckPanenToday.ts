import { useQuery } from '@tanstack/react-query';
import { panenApi } from '../api/panenApi';

export const useCheckPanenToday = () => {
  return useQuery({
    queryKey: ['panen', 'today-submission'],
    queryFn: () => panenApi.checkPanenSubmissionToday(),
    staleTime: 1000 * 60 * 5, // 5 menit
  });
};