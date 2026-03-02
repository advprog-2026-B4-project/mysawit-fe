import apiClient from "@/lib/api/client";

export type PanenStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface PanenDTO {
  panenId: string;
  buruhId: string;
  buruhName: string;
  kebunId: string;
  weight: number;
  status: PanenStatus;
  photoUrls: string[];
  timestamp: string;
}

export interface CreatePanenRequest {
  kebunId: string;
  weight: number;
  photoUrls: string[];
}

export interface RejectPanenRequest {
  reason: string;
}

export interface PanenListFilter {
  startDate?: string;
  endDate?: string;
  status?: PanenStatus;
  buruhName?: string;
}

export const panenApi = {
  createPanen: async (payload: CreatePanenRequest): Promise<PanenDTO> => {
    const { data } = await apiClient.post<PanenDTO>("/api/panen", payload);
    return data;
  },

  getPanenById: async (panenId: string): Promise<PanenDTO> => {
    const { data } = await apiClient.get<PanenDTO>(`/api/panen/${panenId}`);
    return data;
  },

  listPanenByBuruh: async (buruhId: string, filter?: PanenListFilter): Promise<PanenDTO[]> => {
    const { data } = await apiClient.get<PanenDTO[]>(`/api/panen/buruh/${buruhId}`, {
      params: filter,
    });
    return data;
  },

  listPanenByMandor: async (filter?: PanenListFilter): Promise<PanenDTO[]> => {
    const { data } = await apiClient.get<PanenDTO[]>("/api/panen/mandor", { params: filter });
    return data;
  },

  approvePanen: async (panenId: string): Promise<PanenDTO> => {
    const { data } = await apiClient.post<PanenDTO>(`/api/panen/${panenId}/approve`);
    return data;
  },

  rejectPanen: async (panenId: string, payload: RejectPanenRequest): Promise<PanenDTO> => {
    const { data } = await apiClient.post<PanenDTO>(`/api/panen/${panenId}/reject`, payload);
    return data;
  },

  getApprovedPanenByKebun: async (kebunId: string): Promise<PanenDTO[]> => {
    const { data } = await apiClient.get<PanenDTO[]>(`/api/panen/kebun/${kebunId}/approved`);
    return data;
  },
} as const;
