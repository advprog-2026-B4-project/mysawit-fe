import apiClient from '@/lib/api/client';

// --- DTO Kebun 
export interface CoordinateDTO {
  lat: number;
  lng: number;
}

export interface KebunDTO {
  kebunId: string;
  nama: string;
  kode: string;
  luas: number;
  coordinates: CoordinateDTO[];
}

// --- DTO Panen 
export interface CreatePanenRequestDTO {
  kebunId: string;
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

export const panenApi = {
  createPanen: async (data: CreatePanenRequestDTO): Promise<PanenDTO> => {
    return apiClient.post<any, PanenDTO>('/api/panen', data);
  },

  getDaftarKebun: async (): Promise<KebunDTO[]> => {
    return apiClient.get<any, KebunDTO[]>('/api/kebun'); 
  },
};