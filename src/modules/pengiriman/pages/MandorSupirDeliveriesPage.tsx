"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { getRole, getToken } from "@/lib/api/tokenStorage";
import { compactPengirimanId, deliveryStatusClass, formatTimestamp, formatWeight } from "../components/PengirimanShared";
import { useMandorSupirDeliveries, useMandorSupirList } from "../hooks/usePengiriman";

export default function MandorSupirDeliveriesPage() {
  const hasSession = Boolean(getToken());
  const role = getRole();
  const { supirId } = useParams<{ supirId: string }>();

  const supirListQuery = useMandorSupirList(undefined, {
    enabled: hasSession && role === "MANDOR",
  });
  const deliveriesQuery = useMandorSupirDeliveries(supirId, {
    enabled: hasSession && role === "MANDOR" && !!supirId,
  });

  const supirList = supirListQuery.data ?? [];
  const deliveries = (deliveriesQuery.data ?? []).filter((delivery) => delivery.supirId === supirId);
  const supir = supirList.find((item) => item.supirId === supirId);
  const refetchDeliveries = deliveriesQuery.refetch;

  useEffect(() => {
    if (hasSession && role === "MANDOR" && supirId) {
      void refetchDeliveries();
    }
  }, [hasSession, refetchDeliveries, role, supirId]);

  if (!hasSession) {
    return (
      <div className="min-h-screen bg-cream px-6 py-12">
        <div className="max-w-3xl mx-auto border border-cream-dark bg-white rounded-md px-8 py-10 text-center">
          <h1 className="font-serif text-[30px] text-text-dark">Profil Supir</h1>
          <p className="mt-2 font-sans text-sm text-text-light">
            Anda perlu login terlebih dahulu untuk melihat detail supir.
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

  if (role !== "MANDOR") {
    return (
      <div className="min-h-screen bg-cream px-6 py-12">
        <div className="max-w-3xl mx-auto border border-cream-dark bg-white rounded-md px-8 py-10 text-center">
          <h1 className="font-serif text-[30px] text-text-dark">Akses Terbatas</h1>
          <p className="mt-2 font-sans text-sm text-text-light">
            Halaman ini khusus untuk pengguna dengan role MANDOR.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <Link href="/mandor/supir" className="inline-flex items-center gap-2 font-sans text-[12px] tracking-[0.08em] uppercase text-text-light no-underline mb-6">
          {"<-"} Kembali ke daftar supir
        </Link>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-serif text-[36px] text-text-dark">
              {supir?.name ?? "Profil Supir"}
            </h1>
            <p className="mt-2 font-sans text-[13px] font-light text-text-light">
              {supir ? `${supir.email} - @${supir.username}` : `Riwayat pengiriman untuk supir ${supirId}.`}
            </p>
          </div>

          <Link href="/mandor/pengiriman">
            <Button variant="secondary" className="px-4 py-2 text-[12px]">
              Kelola Pengiriman
            </Button>
          </Link>
        </div>

        <div className="border border-cream-dark rounded-md bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[980px]">
              <div className="grid grid-cols-[1fr_0.8fr_0.8fr_0.8fr_1fr] gap-4 px-6 py-3 bg-cream border-b border-cream-dark">
                <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light">Pengiriman</span>
                <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light">Status</span>
                <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light text-right">Total</span>
                <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light text-right">Diterima</span>
                <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light">Keterangan</span>
              </div>

              {deliveriesQuery.isLoading && (
                <div className="px-6 py-10 text-center font-sans text-[13px] text-text-light">
                  Memuat riwayat pengiriman supir...
                </div>
              )}

              {deliveriesQuery.isError && (
                <div className="px-6 py-10 text-center">
                  <p className="font-sans text-[13px] text-error mb-4">
                    {deliveriesQuery.error instanceof Error ? deliveriesQuery.error.message : "Gagal memuat riwayat pengiriman supir."}
                  </p>
                  <Button variant="ghost" className="px-4 py-2 text-[12px]" onClick={() => deliveriesQuery.refetch()}>
                    Coba lagi
                  </Button>
                </div>
              )}

              {!deliveriesQuery.isLoading && !deliveriesQuery.isError && deliveries.length === 0 && (
                <div className="px-6 py-14 text-center">
                  <h2 className="font-serif text-[24px] text-text-dark">Belum ada pengiriman</h2>
                  <p className="mt-2 font-sans text-[13px] text-text-light">
                    Supir ini belum memiliki riwayat pengiriman pada kebun Anda.
                  </p>
                </div>
              )}

              {!deliveriesQuery.isLoading && !deliveriesQuery.isError && deliveries.map((delivery, index) => (
                <div
                  key={delivery.pengirimanId}
                  className={`grid grid-cols-[1fr_0.8fr_0.8fr_0.8fr_1fr] gap-4 items-center px-6 py-4 ${
                    index < deliveries.length - 1 ? "border-b border-cream-dark" : ""
                  }`}
                >
                  <div>
                    <p className="font-mono text-[12px] text-text-mid" title={delivery.pengirimanId}>
                      {compactPengirimanId(delivery.pengirimanId)}
                    </p>
                    <p className="mt-1 font-sans text-[11px] text-text-light">
                      {formatTimestamp(delivery.timestamp)}
                    </p>
                  </div>

                  <div>
                    <span className={`inline-block px-2.5 py-1 rounded border text-[11px] font-medium ${deliveryStatusClass(delivery.status)}`}>
                      {delivery.status}
                    </span>
                  </div>

                  <div className="text-right font-sans text-[13px] text-text-dark">
                    {formatWeight(delivery.totalWeight)}
                  </div>

                  <div className="text-right font-sans text-[13px] text-text-dark">
                    {formatWeight(delivery.acceptedWeight)}
                  </div>

                  <div>
                    {delivery.statusReason ? (
                      <p className="font-sans text-[12px] text-text-mid">{delivery.statusReason}</p>
                    ) : (
                      <p className="font-sans text-[12px] text-text-light">Tidak ada catatan.</p>
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
