import apiClient from "@/lib/api/client";

export type PengirimanStatus =
  | "ASSIGNED"
  | "IN_TRANSIT"
  | "TIBA"
  | "APPROVED_MANDOR"
  | "APPROVED_ADMIN"
  | "PARTIAL"
  | "REJECTED_MANDOR"
  | "REJECTED_ADMIN";

export interface PengirimanDTO {
  pengirimanId: string;
  supirId: string;
  mandorId: string;
  status: PengirimanStatus;
  totalWeight: number;
  acceptedWeight: number;
  timestamp: string;
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
  mandorName?: string;
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

  listApprovedDeliveriesForAdmin: async (filter?: PengirimanListFilter): Promise<PengirimanDTO[]> => {
    const { data } = await apiClient.get<PengirimanDTO[]>("/api/pengiriman/admin/approved", {
      params: filter,
    });
    return data;
  },
} as const;
