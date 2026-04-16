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

export const panenApi = {
  createPanen: async (data: CreatePanenRequestDTO): Promise<PanenDTO> => {
    return apiClient.post<unknown, PanenDTO>('/api/panen', data);
  },
  
  checkPanenSubmissionToday: async (): Promise<boolean> => {
    return apiClient.get<unknown, boolean>('/api/panen/checksubmission');
  },

  getPanenMandor: async (params?: GetPanenMandorParams): Promise<PanenDTO[]> => {
    const response = await apiClient.get('/api/panen/mandor', { params });
    return response.data;
  },
};
