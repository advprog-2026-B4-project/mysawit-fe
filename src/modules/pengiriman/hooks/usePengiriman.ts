import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { extractErrorMessage, notify } from "@/lib/toast";
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
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useApprovedDeliveriesForAdmin(filter?: PengirimanListFilter, options?: UseSupirDeliveriesOptions) {
  return useQuery<PengirimanDTO[], Error>({
    queryKey: pengirimanKeys.adminApproved(filter),
    queryFn: () => pengirimanApi.listApprovedDeliveriesForAdmin(filter),
    enabled: options?.enabled ?? true,
  });
}

export function useAssignDelivery() {
  const queryClient = useQueryClient();

  return useMutation<PengirimanDTO, Error, AssignDeliveryRequest>({
    mutationFn: (payload) => pengirimanApi.assignSupirForDelivery(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: pengirimanKeys.all });
      notify.success("Pengiriman berhasil ditugaskan ke supir.");
    },
    onError: (error: unknown) => {
      notify.error(extractErrorMessage(error, "Gagal menugaskan pengiriman."));
    },
  });
}

type UpdateDeliveryVariables = {
  pengirimanId: string;
  payload: UpdateDeliveryStatusRequest;
};

export function useUpdateDeliveryStatus() {
  const queryClient = useQueryClient();

  return useMutation<PengirimanDTO, Error, UpdateDeliveryVariables>({
    mutationFn: ({ pengirimanId, payload }) => pengirimanApi.updateDeliveryStatus(pengirimanId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: pengirimanKeys.all });
      notify.success("Status pengiriman berhasil diperbarui.");
    },
    onError: (error: unknown) => {
      notify.error(extractErrorMessage(error, "Gagal memperbarui status pengiriman."));
    },
  });
}

export function useMandorApproveDelivery() {
  const queryClient = useQueryClient();

  return useMutation<PengirimanDTO, Error, string>({
    mutationFn: (pengirimanId) => pengirimanApi.mandorApproveDelivery(pengirimanId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: pengirimanKeys.all });
      notify.success("Pengiriman berhasil disetujui mandor.");
    },
    onError: (error: unknown) => {
      notify.error(extractErrorMessage(error, "Gagal menyetujui pengiriman."));
    },
  });
}

type RejectDeliveryVariables = {
  pengirimanId: string;
  reason: string;
};

export function useMandorRejectDelivery() {
  const queryClient = useQueryClient();

  return useMutation<PengirimanDTO, Error, RejectDeliveryVariables>({
    mutationFn: ({ pengirimanId, reason }) => pengirimanApi.mandorRejectDelivery(pengirimanId, reason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: pengirimanKeys.all });
      notify.success("Pengiriman berhasil ditolak mandor.");
    },
    onError: (error: unknown) => {
      notify.error(extractErrorMessage(error, "Gagal menolak pengiriman."));
    },
  });
}

type AdminProcessVariables = {
  pengirimanId: string;
  payload: ProcessDeliveryRequest;
};

export function useAdminProcessDelivery() {
  const queryClient = useQueryClient();

  return useMutation<PengirimanDTO, Error, AdminProcessVariables>({
    mutationFn: ({ pengirimanId, payload }) => pengirimanApi.adminProcessDelivery(pengirimanId, payload),
    onSuccess: async (updated) => {
      await queryClient.invalidateQueries({ queryKey: pengirimanKeys.all });
      if (updated.status === "APPROVED_ADMIN") {
        notify.success("Pengiriman berhasil disetujui admin.");
        return;
      }
      if (updated.status === "PARTIAL") {
        notify.success("Pengiriman berhasil diproses parsial oleh admin.");
        return;
      }
      notify.success("Pengiriman berhasil ditolak admin.");
    },
    onError: (error: unknown) => {
      notify.error(extractErrorMessage(error, "Gagal memproses pengiriman."));
    },
  });
}
