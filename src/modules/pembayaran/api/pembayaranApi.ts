import apiClient from "@/lib/api/client";

export type PayrollStatus = "PENDING" | "APPROVED" | "REJECTED";
export type WalletTransactionType = "CREDIT" | "DEBIT";
export type ReferenceType = "PANEN" | "PENGIRIMAN";
export type VariableKey = "UPAH_BURUH" | "UPAH_SUPIR" | "UPAH_MANDOR";

export interface VariabelPokokDTO {
  key: VariableKey;
  label: string;
  description: string;
  value: number;
}

export interface UpdateVariabelPokokRequest {
  key: VariableKey;
  newValue: number;
}

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
  rejectionReason?: string | null;
  processedAt: string | null;
  createdAt: string;
  evidencePhotoUrls?: string[];
}

export interface PayrollPageDTO {
  items: PayrollDTO[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
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
  page?: number;
  size?: number;
}

export const DEFAULT_PAYROLL_PAGE_SIZE = 10;

export const pembayaranApi = {
  getAllVariabelPokok: async (): Promise<VariabelPokokDTO[]> => {
    const { data } = await apiClient.get<VariabelPokokDTO[]>("/api/pembayaran/variabel-pokok");
    return data;
  },

  getVariabelPokok: async (key: VariableKey): Promise<VariabelPokokDTO> => {
    const { data } = await apiClient.get<VariabelPokokDTO>(`/api/pembayaran/variabel-pokok/${key}`);
    return data;
  },

  /** Requires ADMIN role. newValue must be > 0. */
  updateVariabelPokok: async (key: VariableKey, newValue: number): Promise<VariabelPokokDTO> => {
    const { data } = await apiClient.put<VariabelPokokDTO>(
      `/api/pembayaran/variabel-pokok/${key}`,
      { key, newValue } satisfies UpdateVariabelPokokRequest,
    );
    return data;
  },

  getPayrollStatus: async (payrollId: string): Promise<PayrollStatusDTO> => {
    const { data } = await apiClient.get<PayrollStatusDTO>(`/api/pembayaran/payroll/${payrollId}/status`);
    return data;
  },

  getPayrollsByUserId: async (userId: string, filter?: PayrollListFilter): Promise<PayrollPageDTO> => {
    const { data } = await apiClient.get<PayrollPageDTO>(`/api/pembayaran/payroll/user/${userId}`, {
      params: filter,
    });
    return data;
  },

  listAllPayrolls: async (filter?: PayrollListFilter): Promise<PayrollPageDTO> => {
    const { data } = await apiClient.get<PayrollPageDTO>("/api/pembayaran/payroll", { params: filter });
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
    const { data } = await apiClient.get<WalletTransactionDTO[]>(`/api/pembayaran/wallet/${userId}/transactions`);
    return data;
  },

  initiateTopUp: async (amount: number): Promise<{ paymentUrl: string }> => {
    const { data } = await apiClient.post<{ paymentUrl: string }>("/api/pembayaran/wallet/top-up", { amount });
    return data;
  },
} as const;
