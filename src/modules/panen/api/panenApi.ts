import apiClient from '@/lib/api/client';

// DTO Requests
export interface CreatePanenRequestDTO {
  kebunId: string;
  weight: number;
  photoUrls: string[];
  description: string;
}

// DTO Responses
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

export const panenApi = {
  createPanen: async (data: CreatePanenRequestDTO): Promise<PanenDTO> => {
    return apiClient.post<any, PanenDTO>('/api/panen', data);
  },
};