import { useQuery } from "@tanstack/react-query";
import { useCreateMutation } from "@/lib/api/mutations";
import {
  pengirimanApi,
  type AssignedSupirDTO,
  type AssignmentRecommendationDTO,
  type AssignablePanenDTO,
  type AssignDeliveryRequest,
  type PengirimanDTO,
  type PengirimanListFilter,
  type ProcessDeliveryRequest,
  type UpdateDeliveryStatusRequest,
} from "../api/pengirimanApi";

type SupirDeliveryFilter = Pick<PengirimanListFilter, "startDate" | "endDate">;
type UseSupirDeliveriesOptions = {
  enabled?: boolean;
};

export const pengirimanKeys = {
  all: ["pengiriman"] as const,
  supir: (filter?: SupirDeliveryFilter) =>
    ["pengiriman", "supir", filter?.startDate ?? null, filter?.endDate ?? null] as const,
  mandorSupir: (searchNama?: string) =>
    ["pengiriman", "mandor", "supir", searchNama?.trim().toLowerCase() ?? ""] as const,
  mandorPanen: () => ["pengiriman", "mandor", "panen"] as const,
  mandorRecommendation: () => ["pengiriman", "mandor", "recommendation"] as const,
  mandorActive: () => ["pengiriman", "mandor", "active"] as const,
  mandorSupirDeliveries: (supirId: string) => ["pengiriman", "mandor", "supir", supirId, "deliveries"] as const,
  adminApproved: (filter?: PengirimanListFilter) => ["pengiriman", "admin", "approved", filter] as const,
} as const;

// ── Queries ──────────────────────────────────────────────────────

export function useSupirDeliveries(
  filter?: SupirDeliveryFilter,
  options?: UseSupirDeliveriesOptions
) {
  return useQuery<PengirimanDTO[], Error>({
    queryKey: pengirimanKeys.supir(filter),
    queryFn: () => pengirimanApi.listDeliveriesBySupir(filter),
    enabled: options?.enabled ?? true,
  });
}

export function useMandorSupirList(searchNama?: string, options?: UseSupirDeliveriesOptions) {
  return useQuery<AssignedSupirDTO[], Error>({
    queryKey: pengirimanKeys.mandorSupir(searchNama),
    queryFn: () => pengirimanApi.listSupirForMandor(searchNama),
    enabled: options?.enabled ?? true,
  });
}

export function useAssignablePanenForMandor(options?: UseSupirDeliveriesOptions) {
  return useQuery<AssignablePanenDTO[], Error>({
    queryKey: pengirimanKeys.mandorPanen(),
    queryFn: () => pengirimanApi.listAssignablePanenForMandor(),
    enabled: options?.enabled ?? true,
  });
}

export function useAssignmentRecommendationForMandor(options?: UseSupirDeliveriesOptions) {
  return useQuery<AssignmentRecommendationDTO, Error>({
    queryKey: pengirimanKeys.mandorRecommendation(),
    queryFn: () => pengirimanApi.recommendAssignmentForMandor(),
    enabled: options?.enabled ?? true,
  });
}

export function useMandorActiveDeliveries(options?: UseSupirDeliveriesOptions) {
  return useQuery<PengirimanDTO[], Error>({
    queryKey: pengirimanKeys.mandorActive(),
    queryFn: () => pengirimanApi.listActiveDeliveriesByMandor(),
    enabled: options?.enabled ?? true,
  });
}

export function useMandorSupirDeliveries(supirId: string, options?: UseSupirDeliveriesOptions) {
  return useQuery<PengirimanDTO[], Error>({
    queryKey: pengirimanKeys.mandorSupirDeliveries(supirId),
    queryFn: () => pengirimanApi.listDeliveriesOfSupirByMandor(supirId),
    enabled: (options?.enabled ?? true) && !!supirId,
  });
}

export function useApprovedDeliveriesForAdmin(filter?: PengirimanListFilter, options?: UseSupirDeliveriesOptions) {
  return useQuery<PengirimanDTO[], Error>({
    queryKey: pengirimanKeys.adminApproved(filter),
    queryFn: () => pengirimanApi.listApprovedDeliveriesForAdmin(filter),
    enabled: options?.enabled ?? true,
  });
}

// ── Mutations ────────────────────────────────────────────────────

export function useAssignDelivery() {
  return useCreateMutation<PengirimanDTO, AssignDeliveryRequest>({
    mutationFn: (payload) => pengirimanApi.assignSupirForDelivery(payload),
    invalidateKeys: pengirimanKeys.all,
    successMessage: "Pengiriman berhasil ditugaskan ke supir.",
    errorMessage: "Gagal menugaskan pengiriman.",
  });
}

type UpdateDeliveryVariables = {
  pengirimanId: string;
  payload: UpdateDeliveryStatusRequest;
};

export function useUpdateDeliveryStatus() {
  return useCreateMutation<PengirimanDTO, UpdateDeliveryVariables>({
    mutationFn: ({ pengirimanId, payload }) => pengirimanApi.updateDeliveryStatus(pengirimanId, payload),
    invalidateKeys: pengirimanKeys.all,
    successMessage: "Status pengiriman berhasil diperbarui.",
    errorMessage: "Gagal memperbarui status pengiriman.",
  });
}

export function useMandorApproveDelivery() {
  return useCreateMutation<PengirimanDTO, string>({
    mutationFn: (pengirimanId) => pengirimanApi.mandorApproveDelivery(pengirimanId),
    invalidateKeys: pengirimanKeys.all,
    successMessage: "Pengiriman berhasil disetujui mandor.",
    errorMessage: "Gagal menyetujui pengiriman.",
  });
}

type RejectDeliveryVariables = {
  pengirimanId: string;
  reason: string;
};

export function useMandorRejectDelivery() {
  return useCreateMutation<PengirimanDTO, RejectDeliveryVariables>({
    mutationFn: ({ pengirimanId, reason }) => pengirimanApi.mandorRejectDelivery(pengirimanId, reason),
    invalidateKeys: pengirimanKeys.all,
    successMessage: "Pengiriman berhasil ditolak mandor.",
    errorMessage: "Gagal menolak pengiriman.",
  });
}

type AdminProcessVariables = {
  pengirimanId: string;
  payload: ProcessDeliveryRequest;
};

export function useAdminProcessDelivery() {
  return useCreateMutation<PengirimanDTO, AdminProcessVariables>({
    mutationFn: ({ pengirimanId, payload }) => pengirimanApi.adminProcessDelivery(pengirimanId, payload),
    invalidateKeys: pengirimanKeys.all,
    successMessage: (updated) => {
      if (updated.status === "APPROVED_ADMIN") return "Pengiriman berhasil disetujui admin.";
      if (updated.status === "PARTIAL") return "Pengiriman berhasil diproses parsial oleh admin.";
      return "Pengiriman berhasil ditolak admin.";
    },
    errorMessage: "Gagal memproses pengiriman.",
  });
}
