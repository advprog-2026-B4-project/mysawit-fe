import apiClient from "@/lib/api/client";

export type PengirimanStatus =
  | "ASSIGNED"
  | "IN_TRANSIT"
  | "TIBA"
  | "APPROVED"
  | "REJECTED"
  | "APPROVED_MANDOR"
  | "APPROVED_ADMIN"
  | "PARTIAL"
  | "REJECTED_MANDOR"
  | "REJECTED_ADMIN";

export interface PengirimanDTO {
  pengirimanId: string;
  supirId: string;
  supirName?: string | null;
  mandorId: string;
  mandorName?: string | null;
  status: PengirimanStatus;
  totalWeight: number;
  acceptedWeight: number;
  statusReason?: string | null;
  panenIds?: string[];
  timestamp: string;
}

export interface AssignedSupirDTO {
  supirId: string;
  username: string;
  name: string;
  email: string;
}

export interface AssignablePanenDTO {
  panenId: string;
  buruhId: string;
  buruhName: string;
  description: string;
  weight: number;
  timestamp: string;
}

export interface AssignmentRecommendationDTO {
  panenIds: string[];
  panenItems: AssignablePanenDTO[];
  totalWeight: number;
  maxCapacity: number;
  remainingCapacity: number;
}

export interface AssignDeliveryRequest {
  supirId: string;
  panenIds: string[];
}

export interface UpdateDeliveryStatusRequest {
  newStatus: PengirimanStatus;
}

export interface ProcessDeliveryRequest {
  acceptedWeight: number;
  status: "APPROVED_ADMIN" | "PARTIAL" | "REJECTED_ADMIN";
  reason?: string;
}

export interface PengirimanListFilter {
  startDate?: string;
  endDate?: string;
  date?: string;
  mandorName?: string;
}

export interface PengirimanPageDTO {
  items: PengirimanDTO[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const pengirimanApi = {
  assignSupirForDelivery: async (payload: AssignDeliveryRequest): Promise<PengirimanDTO> => {
    const { data } = await apiClient.post<PengirimanDTO>("/api/pengiriman", payload);
    return data;
  },

  getPengirimanById: async (pengirimanId: string): Promise<PengirimanDTO> => {
    const { data } = await apiClient.get<PengirimanDTO>(`/api/pengiriman/${pengirimanId}`);
    return data;
  },

  updateDeliveryStatus: async (
    pengirimanId: string,
    payload: UpdateDeliveryStatusRequest
  ): Promise<PengirimanDTO> => {
    const { data } = await apiClient.put<PengirimanDTO>(
      `/api/pengiriman/${pengirimanId}/status`,
      payload
    );
    return data;
  },

  listDeliveriesBySupir: async (filter?: PengirimanListFilter): Promise<PengirimanDTO[]> => {
    const { data } = await apiClient.get<PengirimanDTO[]>("/api/pengiriman/supir", { params: filter });
    return data;
  },

  listSupirForMandor: async (searchNama?: string): Promise<AssignedSupirDTO[]> => {
    const { data } = await apiClient.get<AssignedSupirDTO[]>("/api/pengiriman/mandor/supir", {
      params: { searchNama },
    });
    return data;
  },

  listAssignablePanenForMandor: async (): Promise<AssignablePanenDTO[]> => {
    const { data } = await apiClient.get<AssignablePanenDTO[]>("/api/pengiriman/mandor/panen");
    return data;
  },

  recommendAssignmentForMandor: async (maxCapacity?: number): Promise<AssignmentRecommendationDTO> => {
    const { data } = await apiClient.get<AssignmentRecommendationDTO>("/api/pengiriman/mandor/recommendation", {
      params: { maxCapacity },
    });
    return data;
  },

  listActiveDeliveriesByMandor: async (): Promise<PengirimanDTO[]> => {
    const { data } = await apiClient.get<PengirimanDTO[]>("/api/pengiriman/mandor/active");
    return data;
  },

  listDeliveriesOfSupirByMandor: async (supirId: string): Promise<PengirimanDTO[]> => {
    const { data } = await apiClient.get<PengirimanDTO[]>(`/api/pengiriman/supir/${supirId}/mandor`);
    return data;
  },

  mandorApproveDelivery: async (pengirimanId: string): Promise<PengirimanDTO> => {
    const { data } = await apiClient.post<PengirimanDTO>(`/api/pengiriman/${pengirimanId}/approve`);
    return data;
  },

  mandorRejectDelivery: async (pengirimanId: string, reason: string): Promise<PengirimanDTO> => {
    const { data } = await apiClient.post<PengirimanDTO>(`/api/pengiriman/${pengirimanId}/reject`, {
      reason,
    });
    return data;
  },

  adminProcessDelivery: async (
    pengirimanId: string,
    payload: ProcessDeliveryRequest
  ): Promise<PengirimanDTO> => {
    const { data } = await apiClient.post<PengirimanDTO>(
      `/api/pengiriman/${pengirimanId}/process`,
      payload
    );
    return data;
  },

  listApprovedDeliveriesForAdmin: async (filter?: PengirimanListFilter): Promise<PengirimanPageDTO> => {
    const { data } = await apiClient.get<PengirimanPageDTO>("/api/pengiriman/admin/approved", {
      params: {
        mandorName: filter?.mandorName,
        date: filter?.date,
      },
    });
    return data;
  },
} as const;
