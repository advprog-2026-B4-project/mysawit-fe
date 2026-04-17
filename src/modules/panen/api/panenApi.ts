import { AxiosResponse } from 'axios';
import apiClient from '@/lib/api/client';

// --- DTO Panen 
export interface CreatePanenRequestDTO {
  weight: number;
  photoUrls: string[];
  description: string;
}

export interface PanenPhotoDTO {
  photoId: string;
  url: string;
}

export interface PanenDTO {
  panenId: string;
  buruhId: string;
  buruhName: string;
  kebunId: string;
  description: string;
  weight: number;
  status: string;
  rejectionReason: string | null;
  photos: PanenPhotoDTO[];
  timestamp: string;
}

export interface GetPanenMandorParams {
  buruhName?: string;
  date?: string; 
}

export interface GetPanenByBuruhParams {
  startDate?: string; 
  endDate?: string;
  status?: string;
}

export interface ReviewPanenRequestDTO {
  action: 'APPROVE' | 'REJECT';
  rejectionReason?: string;
}

export const panenApi = {
  createPanen: async (data: CreatePanenRequestDTO): Promise<PanenDTO> => {
    const response = await apiClient.post<unknown, AxiosResponse<PanenDTO>>('/api/panen', data);
    return response.data;
  },
  
  checkPanenSubmissionToday: async (): Promise<boolean> => {
    const response = await apiClient.get<unknown, AxiosResponse<boolean>>('/api/panen/checksubmission');
    return response.data;  
  },

  getPanenMandor: async (params?: GetPanenMandorParams): Promise<PanenDTO[]> => {
    const response = await apiClient.get<unknown, AxiosResponse<PanenDTO[]>>('/api/panen/mandor', { params });
    return response.data;
  },

  getPanenByBuruhId: async (
    buruhId: string,
    params?: GetPanenByBuruhParams
  ): Promise<PanenDTO[]> => {
    const response = await apiClient.get<unknown, AxiosResponse<PanenDTO[]>>(`/api/panen/buruh/${buruhId}`, { params });
    return response.data;
  },

  reviewPanen: async (panenId: string, data: ReviewPanenRequestDTO): Promise<PanenDTO> => {
    const response = await apiClient.patch<unknown, AxiosResponse<PanenDTO>>(`/api/panen/${panenId}/review`, data);
    return response.data;
  },

  uploadPhoto: async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post('/api/storage/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
},
};
