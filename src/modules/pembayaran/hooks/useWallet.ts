import { useQuery } from "@tanstack/react-query";
import { useCreateMutation } from "@/lib/api/mutations";
import { useAuth } from "@/modules/auth";
import {
  pembayaranApi,
  type WalletBalanceDTO,
  type WalletTransactionDTO,
} from "../api/pembayaranApi";

export const walletKeys = {
  balance: (userId: string) => ["wallet", "balance", userId] as const,
  transactions: (userId: string) => ["wallet", "transactions", userId] as const,
} as const;

export function useWalletBalance(userId: string) {
  const { isAuthenticated } = useAuth();
  return useQuery<WalletBalanceDTO, Error>({
    queryKey: walletKeys.balance(userId),
    queryFn: () => pembayaranApi.getUserWalletBalance(userId),
    enabled: isAuthenticated() && !!userId,
  });
}

export function useWalletTransactions(userId: string) {
  const { isAuthenticated } = useAuth();
  return useQuery<WalletTransactionDTO[], Error>({
    queryKey: walletKeys.transactions(userId),
    queryFn: () => pembayaranApi.getWalletTransactions(userId),
    enabled: isAuthenticated() && !!userId,
  });
}

export function useInitiateTopUp() {
  return useCreateMutation<{ paymentUrl: string }, number>({
    mutationFn: (amount) => pembayaranApi.initiateTopUp(amount),
    errorMessage: "Gagal memulai top-up wallet.",
  });
}
