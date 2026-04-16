import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from '@/modules/auth'; 
import { panenApi } from '../api/panenApi';

export const useCheckPanenToday = () => {
  const { data: user } = useCurrentUser(); 

  return useQuery<boolean, Error>({ 
    queryKey: ['panen', 'today-submission', user?.userId], 
    queryFn: () => panenApi.checkPanenSubmissionToday(),
    staleTime: 1000 * 60 * 5,
    enabled: !!user?.userId,
  });
};