"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { getRole, getToken } from "@/lib/api/tokenStorage";
import { deliveryStatusClass, formatTimestamp, formatWeight } from "../components/PengirimanShared";
import { useSupirDeliveries, useUpdateDeliveryStatus } from "../hooks/usePengiriman";

export default function SupirPengirimanPage() {
  const hasSession = Boolean(getToken());
  const role = getRole();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const {
    data = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useSupirDeliveries({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  }, {
    enabled: hasSession && role === "SUPIR",
  });

  const updateDeliveryStatus = useUpdateDeliveryStatus();

  async function handleStatusUpdate(pengirimanId: string, newStatus: "IN_TRANSIT" | "TIBA") {
    await updateDeliveryStatus.mutateAsync({
      pengirimanId,
      payload: { newStatus },
    });
  }

  function handleResetFilter() {
    setStartDate("");
    setEndDate("");
  }

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
            Lihat riwayat penugasan pengiriman, filter berdasarkan tanggal, dan perbarui status saat perjalanan berlangsung.
          </p>
        </div>

        <div className="mb-6 rounded-md border border-cream-dark bg-white p-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]">
          <label className="block">
            <span className="block font-sans text-[11px] tracking-[0.08em] uppercase text-text-light mb-2">
              Dari Tanggal
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              aria-label="Tanggal mulai"
              className="w-full rounded border border-sand bg-cream px-3 py-2 font-sans text-[13px] text-text-dark outline-none focus:border-forest"
            />
          </label>

          <label className="block">
            <span className="block font-sans text-[11px] tracking-[0.08em] uppercase text-text-light mb-2">
              Sampai Tanggal
            </span>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              aria-label="Tanggal akhir"
              className="w-full rounded border border-sand bg-cream px-3 py-2 font-sans text-[13px] text-text-dark outline-none focus:border-forest"
            />
          </label>

          <div className="flex items-end">
            <Button type="button" variant="ghost" onClick={handleResetFilter}>
              Reset Filter
            </Button>
          </div>
        </div>

        <div className="border border-cream-dark rounded-md bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[1140px]">
              <div className="grid grid-cols-[1.15fr_0.7fr_0.7fr_0.8fr_1fr_0.95fr] gap-4 px-6 py-3 bg-cream border-b border-cream-dark">
                <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light">ID Pengiriman</span>
                <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light text-center">Status</span>
                <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light text-right">Total</span>
                <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light text-right">Diterima</span>
                <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light">Keterangan</span>
                <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light text-right">Aksi</span>
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
                    Saat ini belum ada penugasan pengiriman yang cocok dengan filter tanggal.
                  </p>
                </div>
              )}

              {!isLoading && !isError && data.map((item, index) => (
                <div
                  key={item.pengirimanId}
                  className={`grid grid-cols-[1.15fr_0.7fr_0.7fr_0.8fr_1fr_0.95fr] gap-4 items-center px-6 py-4 ${
                    index < data.length - 1 ? "border-b border-cream-dark" : ""
                  }`}
                >
                  <div>
                    <span className="font-mono text-[12px] text-text-mid break-all">{item.pengirimanId}</span>
                    <p className="mt-1 font-sans text-[11px] text-text-light">
                      {formatTimestamp(item.timestamp)}
                    </p>
                  </div>

                  <div className="text-center">
                    <span className={`inline-block px-2.5 py-1 rounded border text-[11px] font-medium ${deliveryStatusClass(item.status)}`}>
                      {item.status}
                    </span>
                  </div>

                  <span className="text-right font-sans text-[13px] text-text-dark">
                    {formatWeight(item.totalWeight)}
                  </span>

                  <span className="text-right font-sans text-[13px] text-text-dark">
                    {formatWeight(item.acceptedWeight)}
                  </span>

                  <div>
                    {item.statusReason ? (
                      <p className="font-sans text-[12px] text-text-mid">{item.statusReason}</p>
                    ) : (
                      <p className="font-sans text-[12px] text-text-light">Tidak ada catatan.</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    {item.status === "ASSIGNED" && (
                      <Button
                        variant="secondary"
                        className="px-4 py-2 text-[12px]"
                        loading={updateDeliveryStatus.isPending}
                        onClick={() => void handleStatusUpdate(item.pengirimanId, "IN_TRANSIT")}
                      >
                        Mulai Kirim
                      </Button>
                    )}

                    {item.status === "IN_TRANSIT" && (
                      <Button
                        variant="primary"
                        className="px-4 py-2 text-[12px]"
                        loading={updateDeliveryStatus.isPending}
                        onClick={() => void handleStatusUpdate(item.pengirimanId, "TIBA")}
                      >
                        Tandai Tiba
                      </Button>
                    )}

                    {item.status !== "ASSIGNED" && item.status !== "IN_TRANSIT" && (
                      <span className="font-sans text-[12px] text-text-light">Tidak ada aksi</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
