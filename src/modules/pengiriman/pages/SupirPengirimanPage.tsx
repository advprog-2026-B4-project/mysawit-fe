"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getRole, getToken } from "@/lib/api/tokenStorage";
import type { PengirimanStatus } from "../api/pengirimanApi";
import { useSupirDeliveries } from "../hooks/usePengiriman";

function statusClass(status: PengirimanStatus): string {
  if (status === "REJECTED" || status === "REJECTED_ADMIN" || status === "REJECTED_MANDOR") {
    return "text-error border-error bg-error/5";
  }
  if (status === "APPROVED" || status === "APPROVED_ADMIN" || status === "APPROVED_MANDOR") {
    return "text-success border-success bg-success/5";
  }
  return "text-forest border-forest/35 bg-forest/5";
}

function formatWeight(weight: number) {
  return `${weight.toLocaleString("id-ID")} kg`;
}

function formatTimestamp(timestamp: string) {
  return new Date(timestamp).toLocaleString("id-ID", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SupirPengirimanPage() {
  const hasSession = Boolean(getToken());
  const role = getRole();

  const {
    data = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useSupirDeliveries(undefined, {
    enabled: hasSession && role === "SUPIR",
  });

  if (!hasSession) {
    return (
      <div className="min-h-screen bg-cream px-6 py-12">
        <div className="max-w-3xl mx-auto border border-cream-dark bg-white rounded-md px-8 py-10 text-center">
          <h1 className="font-serif text-[30px] text-text-dark">Daftar Pengiriman Supir</h1>
          <p className="mt-2 font-sans text-sm text-text-light">
            Anda perlu login terlebih dahulu untuk melihat daftar pengiriman.
          </p>
          <div className="mt-6">
            <Link href="/login">
              <Button variant="primary">Masuk</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (role !== "SUPIR") {
    return (
      <div className="min-h-screen bg-cream px-6 py-12">
        <div className="max-w-3xl mx-auto border border-cream-dark bg-white rounded-md px-8 py-10 text-center">
          <h1 className="font-serif text-[30px] text-text-dark">Akses Terbatas</h1>
          <p className="mt-2 font-sans text-sm text-text-light">
            Halaman ini khusus untuk pengguna dengan role SUPIR.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-[36px] text-text-dark">Pengiriman Saya</h1>
          <p className="mt-2 font-sans text-[13px] font-light text-text-light">
            Daftar pengiriman yang sedang atau sudah ditugaskan kepada Anda.
          </p>
        </div>

        <div className="border border-cream-dark rounded-md bg-white overflow-hidden">
          <div className="grid grid-cols-[1.35fr_auto_auto_auto_auto] gap-4 px-6 py-3 bg-cream border-b border-cream-dark">
            <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light">ID Pengiriman</span>
            <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light">Status</span>
            <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light text-right">Total</span>
            <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light text-right">Diterima</span>
            <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light text-right">Waktu</span>
          </div>

          {isLoading && (
            <div className="px-6 py-10 text-center font-sans text-[13px] text-text-light">
              Memuat daftar pengiriman...
            </div>
          )}

          {isError && (
            <div className="px-6 py-10 text-center">
              <p className="font-sans text-[13px] text-error">
                {error?.message ?? "Gagal memuat daftar pengiriman."}
              </p>
              <div className="mt-4">
                <Button variant="ghost" onClick={() => refetch()}>
                  Coba lagi
                </Button>
              </div>
            </div>
          )}

          {!isLoading && !isError && data.length === 0 && (
            <div className="px-6 py-14 text-center">
              <h2 className="font-serif text-[24px] text-text-dark">Belum ada pengiriman</h2>
              <p className="mt-2 font-sans text-[13px] text-text-light">
                Saat ini belum ada penugasan pengiriman untuk akun Anda.
              </p>
            </div>
          )}

          {!isLoading && !isError && data.map((item, index) => (
            <div
              key={item.pengirimanId}
              className={`grid grid-cols-[1.35fr_auto_auto_auto_auto] gap-4 items-center px-6 py-4 ${
                index < data.length - 1 ? "border-b border-cream-dark" : ""
              }`}
            >
              <span className="font-mono text-[12px] text-text-mid">{item.pengirimanId}</span>
              <span className={`inline-block px-2.5 py-1 rounded border text-[11px] font-medium ${statusClass(item.status)}`}>
                {item.status}
              </span>
              <span className="text-right font-sans text-[13px] text-text-dark">
                {formatWeight(item.totalWeight)}
              </span>
              <span className="text-right font-sans text-[13px] text-text-dark">
                {formatWeight(item.acceptedWeight)}
              </span>
              <span className="text-right font-sans text-[12px] text-text-light">
                {formatTimestamp(item.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
