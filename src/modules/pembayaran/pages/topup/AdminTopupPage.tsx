"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { getUserIdFromToken } from "@/lib/api/tokenStorage";
import { useWalletBalance, useWalletTransactions, useInitiateTopUp } from "../../hooks/useWallet";
import { formatPayrollDate } from "../../components/PayrollShared";
import { formatRupiah } from "../../api/pembayaranApi";
import TopupInput from "../../components/TopupInput";
import TransactionRow from "../../components/TransactionRow";

// formatAmountInput and parseAmount removed — TopupInput component handles formatting internally

export default function AdminTopupPage() {
  const [amountInput, setAmountInput] = useState("");
  const [amountError, setAmountError] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  const adminId = getUserIdFromToken() ?? "";

  const balance = useWalletBalance(adminId);
  const transactions = useWalletTransactions(adminId);
  const initiateTopUp = useInitiateTopUp();

  const handleAmountChange = (value: string) => {
    setAmountInput(value);
    setAmountError("");
  };

  const handleSubmit = async () => {
    const rawValue = amountInput.replace(/\D/g, "");
    const amount = parseInt(rawValue || "0", 10);
    if (!amount || amount < 10000) {
      setAmountError("Minimum topup adalah Rp10.000");
      return;
    }
    if (amount % 10000 !== 0) {
      setAmountError("Nominal topup harus kelipatan Rp10.000 ($1 = Rp10.000)");
      return;
    }

    setIsRedirecting(true);
    try {
      const result = await initiateTopUp.mutateAsync(amount);
      window.location.href = result.paymentUrl;
    } catch {
      setIsRedirecting(false);
    }
  };

  const isPending = isRedirecting || initiateTopUp.isPending;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-[36px] text-text-dark">Topup Saldo</h1>
        <p className="mt-2 font-sans text-[13px] font-light text-text-light">
          Tambahkan saldo wallet admin melalui payment gateway Midtrans.
        </p>
      </div>

      {/* Balance Card */}
      <div className="border border-cream-dark bg-white rounded-md px-6 py-6 mb-6">
        <p className="font-sans text-[10px] font-medium tracking-[0.12em] uppercase text-text-light mb-3">
          Saldo Wallet Admin
        </p>
        {balance.isLoading ? (
          <p className="font-sans text-[13px] text-text-light">Memuat saldo...</p>
        ) : balance.isError ? (
          <p className="font-sans text-[13px] text-error">Gagal memuat saldo.</p>
        ) : (
          <>
            <div className="flex items-baseline gap-3">
              <p className="font-serif text-[42px] leading-none text-forest">
                ${balance.data?.balance ?? 0}
              </p>
              <p className="font-sans text-[16px] text-text-mid">
                = {formatRupiah((balance.data?.balance ?? 0) * 10000)}
              </p>
            </div>
            <p className="mt-2 font-sans text-[12px] text-text-light">
              Update terakhir: {formatPayrollDate(balance.data?.lastUpdated ?? null)}
            </p>
          </>
        )}
      </div>

      {/* Topup Form */}
      <div className="border border-cream-dark bg-white rounded-md px-6 py-6 mb-6">
        <p className="font-sans text-[10px] font-medium tracking-[0.12em] uppercase text-text-light mb-4">
          Topup via Midtrans
        </p>

        <div className="flex gap-3">
          <div className="flex-1">
            <TopupInput
              value={amountInput}
              onChange={handleAmountChange}
              error={amountError}
              disabled={isPending}
            />
          </div>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !amountInput}
            className="self-start px-6 py-3"
          >
            {isPending ? "Memuat..." : "Bayar Sekarang"}
          </Button>
        </div>

        <p className="mt-3 font-sans text-[11px] text-text-light">
          Anda akan diarahkan ke halaman pembayaran Midtrans Snap untuk menyelesaikan transaksi.
        </p>
      </div>

      {/* Transaction History */}
      <div className="border border-cream-dark bg-white rounded-md overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-dark bg-cream">
          <p className="font-sans text-[10px] font-medium tracking-[0.12em] uppercase text-text-light">
            Riwayat Transaksi Wallet
          </p>
        </div>

        {transactions.isLoading ? (
          <div className="px-6 py-12 text-center font-sans text-[13px] text-text-light">
            Memuat riwayat transaksi...
          </div>
        ) : transactions.isError ? (
          <div className="px-6 py-12 text-center font-sans text-[13px] text-error">
            Gagal memuat riwayat transaksi.
          </div>
        ) : transactions.data?.length === 0 ? (
          <div className="px-6 py-12 text-center font-sans text-[13px] text-text-light">
            Belum ada transaksi wallet.
          </div>
        ) : (
          <div className="divide-y divide-cream-dark">
            {transactions.data?.map((tx) => (
              <TransactionRow key={tx.transactionId} transaction={tx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}