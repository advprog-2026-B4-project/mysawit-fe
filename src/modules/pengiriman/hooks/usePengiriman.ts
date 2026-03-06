import { useQuery } from "@tanstack/react-query";
import { pengirimanApi, type PengirimanDTO, type PengirimanListFilter } from "../api/pengirimanApi";

type SupirDeliveryFilter = Pick<PengirimanListFilter, "startDate" | "endDate">;
type UseSupirDeliveriesOptions = {
  enabled?: boolean;
};

export const pengirimanKeys = {
  all: ["pengiriman"] as const,
  supir: (filter?: SupirDeliveryFilter) =>
    ["pengiriman", "supir", filter?.startDate ?? null, filter?.endDate ?? null] as const,
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
