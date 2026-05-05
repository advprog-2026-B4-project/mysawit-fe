"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { notify } from "@/lib/toast";
import { getUserIdFromToken } from "@/lib/api/tokenStorage";
import { useWalletBalance, useWalletTransactions, useInitiateTopUp } from "@/modules/pembayaran/hooks/useWallet";
import { formatPayrollMoney, formatPayrollDate, compactPayrollId } from "@/modules/pembayaran/components/PayrollShared";

function formatAmountInput(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return parseInt(digits, 10).toLocaleString("id-ID");
}

function parseAmount(value: string): number {
  return parseInt(value.replace(/\D/g, ""), 10) || 0;
}

function StatusToastEffect() {
  const searchParams = useSearchParams();
  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "success") {
      notify.success("Pembayaran berhasil! Saldo akan diperbarui shortly.");
    } else if (status === "cancelled" || status === "failed") {
      notify.error("Pembayaran gagal atau dibatalkan. Silakan coba lagi.");
    }
  }, [searchParams]);
  return null;
}

export default function AdminTopupPage() {
  const [amountInput, setAmountInput] = useState("");
  const [amountError, setAmountError] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  const adminId = getUserIdFromToken() ?? "";

  const balance = useWalletBalance(adminId);
  const transactions = useWalletTransactions(adminId);
  const initiateTopUp = useInitiateTopUp(adminId);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatAmountInput(raw);
    setAmountInput(formatted);
    setAmountError("");
  };

  const handleSubmit = async () => {
    const amount = parseAmount(amountInput);
    if (!amount || amount < 10000) {
      setAmountError("Minimum topup adalah Rp10.000");
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

      <Suspense>
        <StatusToastEffect />
      </Suspense>

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
            <p className="font-serif text-[42px] leading-none text-forest">
              {formatPayrollMoney(balance.data?.balance ?? 0)}
            </p>
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
            <label className="sr-only" htmlFor="amount">Jumlah topup (Rp)</label>
            <input
              id="amount"
              type="text"
              inputMode="numeric"
              placeholder="Contoh: 50.000"
              value={amountInput}
              onChange={handleAmountChange}
              disabled={isPending}
              className={`w-full px-4 py-3 border rounded-md font-sans text-[14px] text-text-dark placeholder:text-text-light bg-white focus:outline-none focus:ring-1 ${
                amountError
                  ? "border-error focus:ring-error"
                  : "border-cream-dark focus:ring-forest focus:border-forest"
              }`}
            />
            {amountError && (
              <p className="mt-1 font-sans text-[12px] text-error">{amountError}</p>
            )}
            <p className="mt-1 font-sans text-[11px] text-text-light">
              Minimum Rp10.000
            </p>
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
              <div key={tx.transactionId} className="grid grid-cols-[1fr_auto] gap-4 px-6 py-4 items-center">
                <div>
                  <p className="font-sans text-[13px] text-text-dark">
                    {tx.type === "CREDIT" ? "Kredit" : "Debit"}
                    {tx.reference ? ` — ${tx.reference}` : ""}
                  </p>
                  <p className="font-mono text-[11px] text-text-mid mt-0.5">
                    {compactPayrollId(tx.transactionId)}
                  </p>
                  <p className="font-sans text-[11px] text-text-light mt-0.5">
                    {formatPayrollDate(tx.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-sans text-[14px] font-medium ${
                    tx.type === "CREDIT" ? "text-green" : "text-text-dark"
                  }`}>
                    {tx.type === "CREDIT" ? "+" : "-"}
                    {formatPayrollMoney(tx.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}