import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth";
import { extractErrorMessage, notify } from "@/lib/toast";
import {
  pembayaranApi,
  type WalletBalanceDTO,
  type WalletTransactionDTO,
} from "../api/pembayaranApi";

// Query keys
export const walletKeys = {
  balance:      (userId: string) => ["wallet", "balance", userId] as const,
  transactions: (userId: string) => ["wallet", "transactions", userId] as const,
} as const;

// Queries

/**
 * Returns wallet balance for the given user.
 * A non-admin user must pass their own userId - enforced server-side by RBAC.
 */
export function useWalletBalance(userId: string) {
  const { isAuthenticated } = useAuth();
  return useQuery<WalletBalanceDTO, Error>({
    queryKey: walletKeys.balance(userId),
    queryFn:  () => pembayaranApi.getUserWalletBalance(userId),
    enabled:  isAuthenticated() && !!userId,
  });
}

/**
 * Returns wallet transaction history for the given user.
 * A non-admin user must pass their own userId - enforced server-side by RBAC.
 */
export function useWalletTransactions(userId: string) {
  const { isAuthenticated } = useAuth();
  return useQuery<WalletTransactionDTO[], Error>({
    queryKey: walletKeys.transactions(userId),
    queryFn:  () => pembayaranApi.getWalletTransactions(userId),
    enabled:  isAuthenticated() && !!userId,
  });
}

// Mutations

/** Initiate a wallet top-up; returns a Midtrans payment URL. Requires authentication. */
export function useInitiateTopUp() {
  return useMutation<{ paymentUrl: string }, Error, number>({
    mutationFn: (amount) => pembayaranApi.initiateTopUp(amount),
    onError: (error: unknown) => {
      notify.error(extractErrorMessage(error, "Gagal memulai top-up wallet."));
    },
  });
}
