"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

function StatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("order_id");
  const transactionStatus = searchParams.get("transaction_status");

  const isSuccess = transactionStatus === "settlement" || transactionStatus === "capture";
  const isPending = transactionStatus === "pending";

  return (
    <div className="max-w-md mx-auto mt-12 border border-cream-dark bg-white rounded-md px-8 py-10 text-center">
      <div className="flex justify-center mb-6">
        {isSuccess ? (
          <div className="w-20 h-20 rounded-full bg-green/10 flex items-center justify-center text-green">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
        ) : isPending ? (
          <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-600">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center text-error">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </div>
        )}
      </div>

      <h1 className="font-serif text-3xl text-text-dark mb-2">
        {isSuccess ? "Pembayaran Berhasil" : isPending ? "Pembayaran Diproses" : "Pembayaran Gagal"}
      </h1>
      
      <p className="font-sans text-[14px] text-text-light mb-6">
        {isSuccess 
          ? "Saldo wallet Anda telah berhasil ditambahkan. Sistem backend kami sedang memperbarui data Anda." 
          : isPending 
          ? "Silakan selesaikan pembayaran Anda. Saldo akan otomatis masuk setelah pembayaran dikonfirmasi."
          : "Maaf, transaksi Anda gagal atau dibatalkan. Silakan coba lagi."}
      </p>

      {orderId && (
        <div className="bg-cream p-4 rounded-md mb-8 inline-block text-left mx-auto">
          <p className="font-sans text-[11px] text-text-light uppercase tracking-wider mb-1">Order ID</p>
          <p className="font-mono text-[13px] text-text-dark font-medium">{orderId}</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Button onClick={() => router.push("/admin/pembayaran/topup")} className="w-full py-3">
          Kembali ke Topup
        </Button>
      </div>
    </div>
  );
}

export default function TopupStatusPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20 font-sans text-text-light">Memuat status...</div>}>
      <StatusContent />
    </Suspense>
  );
}