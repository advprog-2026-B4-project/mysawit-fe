import { useQuery } from "@tanstack/react-query";
import { useCreateMutation } from "@/lib/api/mutations";
import { useAuth } from "@/modules/auth";
import {
  pembayaranApi,
  type PayrollDTO,
  type PayrollListFilter,
  type PayrollPageDTO,
  type PayrollStatusDTO,
} from "../api/pembayaranApi";

export const payrollKeys = {
  all: ["payroll"] as const,
  status: (payrollId: string) => ["payroll", "status", payrollId] as const,
  byUser: (userId: string, filter?: PayrollListFilter) => ["payroll", "user", userId, filter] as const,
  list: (filter?: PayrollListFilter) => ["payroll", "list", filter] as const,
} as const;

export function usePayrollStatus(payrollId: string) {
  const { isAuthenticated } = useAuth();
  return useQuery<PayrollStatusDTO, Error>({
    queryKey: payrollKeys.status(payrollId),
    queryFn: () => pembayaranApi.getPayrollStatus(payrollId),
    enabled: isAuthenticated() && !!payrollId,
  });
}

export function usePayrollsByUser(userId: string, filter?: PayrollListFilter) {
  const { isAuthenticated } = useAuth();
  return useQuery<PayrollPageDTO, Error>({
    queryKey: payrollKeys.byUser(userId, filter),
    queryFn: () => pembayaranApi.getPayrollsByUserId(userId, filter),
    enabled: isAuthenticated() && !!userId,
  });
}

export function useAllPayrolls(filter?: PayrollListFilter) {
  const { isAuthenticated } = useAuth();
  return useQuery<PayrollPageDTO, Error>({
    queryKey: payrollKeys.list(filter),
    queryFn: () => pembayaranApi.listAllPayrolls(filter),
    enabled: isAuthenticated(),
  });
}

export function useApprovePayroll() {
  return useCreateMutation<PayrollDTO, string>({
    mutationFn: (payrollId) => pembayaranApi.approvePayroll(payrollId),
    invalidateKeys: [payrollKeys.all, (data: PayrollDTO) => payrollKeys.status(data.payrollId)],
    successMessage: "Payroll berhasil disetujui.",
    errorMessage: "Gagal menyetujui payroll.",
  });
}

interface RejectVariables {
  payrollId: string;
  reason: string;
}

export function useRejectPayroll() {
  return useCreateMutation<PayrollDTO, RejectVariables>({
    mutationFn: ({ payrollId, reason }) => pembayaranApi.rejectPayroll(payrollId, reason),
    invalidateKeys: [
      payrollKeys.all,
      (data: PayrollDTO) => payrollKeys.status(data.payrollId),
    ],
    successMessage: "Payroll berhasil ditolak.",
    errorMessage: "Gagal menolak payroll.",
  });
}
