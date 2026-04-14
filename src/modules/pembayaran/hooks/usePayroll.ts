import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth";
import {
  pembayaranApi,
  type PayrollDTO,
  type PayrollListFilter,
  type PayrollPageDTO,
  type PayrollStatusDTO,
} from "../api/pembayaranApi";

// Query keys
export const payrollKeys = {
  all: ["payroll"] as const,
  status:  (payrollId: string) => ["payroll", "status", payrollId] as const,
  byUser:  (userId: string, filter?: PayrollListFilter) => ["payroll", "user", userId, filter] as const,
  list:    (filter?: PayrollListFilter) => ["payroll", "list", filter] as const,
} as const;

// Queries

/** Returns the status of a single payroll. Requires authentication. */
export function usePayrollStatus(payrollId: string) {
  const { isAuthenticated } = useAuth();
  return useQuery<PayrollStatusDTO, Error>({
    queryKey: payrollKeys.status(payrollId),
    queryFn:  () => pembayaranApi.getPayrollStatus(payrollId),
    enabled:  isAuthenticated() && !!payrollId,
  });
}

/**
 * Returns payrolls for a specific user.
 * A non-admin user must pass their own userId - enforced server-side by RBAC.
 */
export function usePayrollsByUser(userId: string, filter?: PayrollListFilter) {
  const { isAuthenticated } = useAuth();
  return useQuery<PayrollPageDTO, Error>({
    queryKey: payrollKeys.byUser(userId, filter),
    queryFn:  () => pembayaranApi.getPayrollsByUserId(userId, filter),
    enabled:  isAuthenticated() && !!userId,
  });
}

/** Returns all payrolls. Requires ADMIN role - enforced server-side by RBAC. */
export function useAllPayrolls(filter?: PayrollListFilter) {
  const { isAuthenticated } = useAuth();
  return useQuery<PayrollPageDTO, Error>({
    queryKey: payrollKeys.list(filter),
    queryFn:  () => pembayaranApi.listAllPayrolls(filter),
    enabled:  isAuthenticated(),
  });
}

// Mutations

/** Admin: approve a payroll entry. Requires ADMIN role - enforced server-side by RBAC. */
export function useApprovePayroll() {
  const queryClient = useQueryClient();
  return useMutation<PayrollDTO, Error, string>({
    mutationFn: (payrollId) => pembayaranApi.approvePayroll(payrollId),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.all });
      queryClient.invalidateQueries({ queryKey: payrollKeys.status(updated.payrollId) });
    },
  });
}

interface RejectVariables {
  payrollId: string;
  reason:    string;
}

/** Admin: reject a payroll entry with a reason. Requires ADMIN role - enforced server-side by RBAC. */
export function useRejectPayroll() {
  const queryClient = useQueryClient();
  return useMutation<PayrollDTO, Error, RejectVariables>({
    mutationFn: ({ payrollId, reason }) => pembayaranApi.rejectPayroll(payrollId, reason),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.all });
      queryClient.invalidateQueries({ queryKey: payrollKeys.status(updated.payrollId) });
    },
  });
}
