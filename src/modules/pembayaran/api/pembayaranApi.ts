import apiClient from "@/lib/api/client";

export type PayrollStatus = "PENDING" | "APPROVED" | "REJECTED";
export type WalletTransactionType = "CREDIT" | "DEBIT";
export type ReferenceType = "PANEN" | "PENGIRIMAN";

export interface PayrollDTO {
  payrollId: string;
  userId: string;
  role: string;
  referenceId: string;
  referenceType: ReferenceType;
  weight: number;
  wageRateApplied: number;
  netAmount: number;
  status: PayrollStatus;
  processedAt: string | null;
  createdAt: string;
}

export interface PayrollStatusDTO {
  payrollId: string;
  userId: string;
  amount: number;
  status: PayrollStatus;
  processedAt: string | null;
  paymentReference: string | null;
}

export interface WalletBalanceDTO {
  userId: string;
  balance: number;
  lastUpdated: string;
}

export interface WalletTransactionDTO {
  transactionId: string;
  userId: string;
  payrollId: string;
  amount: number;
  type: WalletTransactionType;
  createdAt: string;
}

export interface PaymentCallbackDTO {
  transactionId: string;
  orderId: string;
  grossAmount: number;
  transactionStatus: string;
  paymentType: string;
  signatureKey: string;
}

export interface PayrollListFilter {
  startDate?: string;
  endDate?: string;
  status?: PayrollStatus;
}

export interface UpdateWageRateRequest {
  type: "BURUH" | "SUPIR" | "MANDOR";
  newRatePerGram: number;
}

export const pembayaranApi = {
  getPayrollStatus: async (payrollId: string): Promise<PayrollStatusDTO> => {
    const { data } = await apiClient.get<PayrollStatusDTO>(
      `/api/pembayaran/payroll/${payrollId}/status`
    );
    return data;
  },

  getPayrollsByUserId: async (userId: string, filter?: PayrollListFilter): Promise<PayrollDTO[]> => {
    const { data } = await apiClient.get<PayrollDTO[]>(`/api/pembayaran/payroll/user/${userId}`, {
      params: filter,
    });
    return data;
  },

  listAllPayrolls: async (filter?: PayrollListFilter): Promise<PayrollDTO[]> => {
    const { data } = await apiClient.get<PayrollDTO[]>("/api/pembayaran/payroll", { params: filter });
    return data;
  },

  approvePayroll: async (payrollId: string): Promise<PayrollDTO> => {
    const { data } = await apiClient.post<PayrollDTO>(`/api/pembayaran/payroll/${payrollId}/approve`);
    return data;
  },

  rejectPayroll: async (payrollId: string, reason: string): Promise<PayrollDTO> => {
    const { data } = await apiClient.post<PayrollDTO>(`/api/pembayaran/payroll/${payrollId}/reject`, {
      reason,
    });
    return data;
  },

  getUserWalletBalance: async (userId: string): Promise<WalletBalanceDTO> => {
    const { data } = await apiClient.get<WalletBalanceDTO>(`/api/pembayaran/wallet/${userId}`);
    return data;
  },

  getWalletTransactions: async (userId: string): Promise<WalletTransactionDTO[]> => {
    const { data } = await apiClient.get<WalletTransactionDTO[]>(
      `/api/pembayaran/wallet/${userId}/transactions`
    );
    return data;
  },

  updateWageRate: async (payload: UpdateWageRateRequest): Promise<void> => {
    await apiClient.post("/api/pembayaran/wage-rate", payload);
  },

  initiateTopUp: async (amount: number): Promise<{ paymentUrl: string }> => {
    const { data } = await apiClient.post<{ paymentUrl: string }>("/api/pembayaran/wallet/top-up", {
      amount,
    });
    return data;
  },
} as const;
