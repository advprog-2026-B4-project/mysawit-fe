import apiClient from "@/lib/api/client";

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

export interface CreateKebunRequest {
  nama: string;
  kode: string;
  luas: number;
  coordinates: CoordinateDTO[];
}

export interface EditKebunRequest {
  nama: string;
  luas: number;
  coordinates: CoordinateDTO[];
}

export interface AssignPersonRequest {
  personId: string;
  kebunId: string;
}

export const kebunApi = {
  listKebun: async (searchNama?: string, searchKode?: string): Promise<KebunDTO[]> => {
    const { data } = await apiClient.get<KebunDTO[]>("/api/kebun", {
      params: { nama: searchNama, kode: searchKode },
    });
    return data;
  },

  getKebunById: async (kebunId: string): Promise<KebunDTO> => {
    const { data } = await apiClient.get<KebunDTO>(`/api/kebun/${kebunId}`);
    return data;
  },

  createKebun: async (payload: CreateKebunRequest): Promise<KebunDTO> => {
    const { data } = await apiClient.post<KebunDTO>("/api/kebun", payload);
    return data;
  },

  editKebun: async (kebunId: string, payload: EditKebunRequest): Promise<KebunDTO> => {
    const { data } = await apiClient.put<KebunDTO>(`/api/kebun/${kebunId}`, payload);
    return data;
  },

  deleteKebun: async (kebunId: string): Promise<void> => {
    await apiClient.delete(`/api/kebun/${kebunId}`);
  },

  assignMandorToKebun: async (mandorId: string, kebunId: string): Promise<void> => {
    await apiClient.post(`/api/kebun/${kebunId}/assign/mandor`, { mandorId });
  },

  moveMandorToKebun: async (mandorId: string, newKebunId: string): Promise<void> => {
    await apiClient.post(`/api/kebun/${newKebunId}/move/mandor`, { mandorId });
  },

  assignSupirToKebun: async (supirId: string, kebunId: string): Promise<void> => {
    await apiClient.post(`/api/kebun/${kebunId}/assign/supir`, { supirId });
  },

  moveSupirToKebun: async (supirId: string, newKebunId: string): Promise<void> => {
    await apiClient.post(`/api/kebun/${newKebunId}/move/supir`, { supirId });
  },

  getMandorByKebun: async (kebunId: string): Promise<{ mandorId: string }> => {
    const { data } = await apiClient.get<{ mandorId: string }>(`/api/kebun/${kebunId}/mandor`);
    return data;
  },
} as const;
