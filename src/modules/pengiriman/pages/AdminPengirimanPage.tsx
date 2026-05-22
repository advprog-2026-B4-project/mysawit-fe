"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { getRole, getToken } from "@/lib/api/tokenStorage";
import { compactPengirimanId, deliveryStatusClass, formatTimestamp, formatWeight, kilogramsInputToGrams } from "../components/PengirimanShared";
import { useAdminProcessDelivery, useApprovedDeliveriesForAdmin } from "../hooks/usePengiriman";

type AdminActionState =
  | { mode: "PARTIAL"; deliveryId: string; totalWeight: number }
  | { mode: "REJECTED_ADMIN"; deliveryId: string; totalWeight: number }
  | null;

export default function AdminPengirimanPage() {
  const hasSession = Boolean(getToken());
  const role = getRole();

  const [searchInput, setSearchInput] = useState("");
  const [searchMandorName, setSearchMandorName] = useState<string | undefined>(undefined);
  const [date, setDate] = useState("");
  const [actionState, setActionState] = useState<AdminActionState>(null);
  const [reason, setReason] = useState("");
  const [partialWeightInput, setPartialWeightInput] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const approvedDeliveriesQuery = useApprovedDeliveriesForAdmin({
    mandorName: searchMandorName,
    date: date || undefined,
  }, {
    enabled: hasSession && role === "ADMIN",
  });
  const adminProcessDelivery = useAdminProcessDelivery();
  const approvedDeliveries = Array.isArray(approvedDeliveriesQuery.data) ? approvedDeliveriesQuery.data : [];

  const approvedCount = approvedDeliveries.length;

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = searchInput.trim();
    setSearchMandorName(trimmed === "" ? undefined : trimmed);
  }

  function handleResetFilter() {
    setSearchInput("");
    setSearchMandorName(undefined);
    setDate("");
  }

  async function handleApprove(deliveryId: string, totalWeight: number) {
    setLocalError(null);
    try {
      await adminProcessDelivery.mutateAsync({
        pengirimanId: deliveryId,
        payload: {
          acceptedWeight: totalWeight,
          status: "APPROVED_ADMIN",
        },
      });
    } catch {
      // handled in hook
    }
  }

  async function handleConfirmAction() {
    /* v8 ignore next 3 -- @preserve */
    if (!actionState) {
      return;
    }

    setLocalError(null);

    if (actionState.mode === "REJECTED_ADMIN") {
      if (!reason.trim()) {
        setLocalError("Alasan penolakan admin wajib diisi.");
        return;
      }

      try {
        await adminProcessDelivery.mutateAsync({
          pengirimanId: actionState.deliveryId,
          payload: {
            acceptedWeight: 0,
            status: "REJECTED_ADMIN",
            reason: reason.trim(),
          },
        });
        setActionState(null);
        setReason("");
      } catch {
        // handled in hook
      }
      return;
    }

    const parsedWeight = kilogramsInputToGrams(partialWeightInput);
    if (parsedWeight == null) {
      setLocalError("Masukkan berat parsial dalam kilogram yang valid.");
      return;
    }
    if (parsedWeight <= 0 || parsedWeight >= actionState.totalWeight) {
      setLocalError("Berat parsial harus lebih dari 0 kg dan lebih kecil dari total pengiriman.");
      return;
    }
    if (!reason.trim()) {
      setLocalError("Alasan partial accept wajib diisi.");
      return;
    }

    try {
      await adminProcessDelivery.mutateAsync({
        pengirimanId: actionState.deliveryId,
        payload: {
          acceptedWeight: parsedWeight,
          status: "PARTIAL",
          reason: reason.trim(),
        },
      });
      setActionState(null);
      setReason("");
      setPartialWeightInput("");
    } catch {
      // handled in hook
    }
  }

  if (!hasSession) {
    return (
      <div className="min-h-screen bg-cream px-6 py-12">
        <div className="max-w-3xl mx-auto border border-cream-dark bg-white rounded-md px-8 py-10 text-center">
          <h1 className="font-serif text-[30px] text-text-dark">Pengiriman</h1>
          <p className="mt-2 font-sans text-sm text-text-light">
            Anda perlu login terlebih dahulu untuk mengelola pengiriman.
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

  if (role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-cream px-6 py-12">
        <div className="max-w-3xl mx-auto border border-cream-dark bg-white rounded-md px-8 py-10 text-center">
          <h1 className="font-serif text-[30px] text-text-dark">Akses Terbatas</h1>
          <p className="mt-2 font-sans text-sm text-text-light">
            Halaman ini khusus untuk pengguna dengan role ADMIN.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream px-4 sm:px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-serif text-[36px] text-text-dark">Pengiriman</h1>
            <p className="mt-2 font-sans text-[13px] font-light text-text-light">
              Proses pengiriman yang sudah disetujui mandor, termasuk approve penuh, reject, dan partial accept.
            </p>
          </div>
          <div className="text-right">
            <p className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light">Siap Diproses</p>
            <p className="font-serif text-[30px] text-forest">{approvedCount}</p>
          </div>
        </div>

        <form
          className="mb-6 rounded-md border border-cream-dark bg-white p-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_0.9fr_auto]"
          onSubmit={handleSearchSubmit}
        >
          <label className="block">
            <span className="block font-sans text-[11px] tracking-[0.08em] uppercase text-text-light mb-2">
              Filter Nama Mandor
            </span>
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Contoh: Awan"
              aria-label="Cari pengiriman"
              className="w-full rounded border border-sand bg-cream px-3 py-2 font-sans text-[13px] text-text-dark outline-none focus:border-forest"
            />
          </label>

          <label className="block">
            <span className="block font-sans text-[11px] tracking-[0.08em] uppercase text-text-light mb-2">
              Filter Tanggal
            </span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              aria-label="Tanggal pengiriman"
              className="w-full rounded border border-sand bg-cream px-3 py-2 font-sans text-[13px] text-text-dark outline-none focus:border-forest"
            />
          </label>

          <div className="flex items-end gap-2">
            <Button type="submit" variant="primary" className="px-4 py-2 text-[12px]">
              Cari
            </Button>
            <Button type="button" variant="ghost" className="px-4 py-2 text-[12px]" onClick={handleResetFilter}>
              Reset
            </Button>
          </div>
        </form>

        {actionState && (
          <div className="mb-6 rounded-md border border-cream-dark bg-white p-5">
            <h2 className="font-serif text-[24px] text-text-dark">
              {actionState.mode === "PARTIAL" ? "Partial Accept" : "Tolak Pengiriman"}
            </h2>
            <p className="mt-2 font-sans text-[13px] text-text-light">
              Pengiriman <span className="font-mono">{actionState.deliveryId}</span>
            </p>

            {actionState.mode === "PARTIAL" && (
              <label className="block mt-4">
                <span className="block font-sans text-[11px] tracking-[0.08em] uppercase text-text-light mb-2">
                  Berat Diterima (kg)
                </span>
                <input
                  value={partialWeightInput}
                  onChange={(event) => setPartialWeightInput(event.target.value)}
                  placeholder="Contoh: 175"
                  aria-label="Berat parsial"
                  className="w-full rounded border border-sand bg-cream px-3 py-2 font-sans text-[13px] text-text-dark outline-none focus:border-forest"
                />
              </label>
            )}

            <label className="block mt-4">
              <span className="block font-sans text-[11px] tracking-[0.08em] uppercase text-text-light mb-2">
                Alasan
              </span>
              <textarea
                rows={3}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder={actionState.mode === "PARTIAL" ? "Tuliskan alasan partial accept..." : "Tuliskan alasan penolakan..."}
                aria-label="Alasan"
                className="w-full rounded border border-sand bg-cream px-3 py-2.5 font-sans text-[13px] text-text-dark outline-none focus:border-forest"
              />
            </label>

            {localError && (
              <p className="mt-4 font-sans text-[13px] text-error">{localError}</p>
            )}

            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                className="px-4 py-2 text-[12px]"
                onClick={() => {
                  setActionState(null);
                  setReason("");
                  setPartialWeightInput("");
                  setLocalError(null);
                }}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant={actionState.mode === "PARTIAL" ? "secondary" : "danger"}
                className="px-4 py-2 text-[12px]"
                loading={adminProcessDelivery.isPending}
                onClick={() => void handleConfirmAction()}
              >
                Konfirmasi
              </Button>
            </div>
          </div>
        )}

        <div className="border border-cream-dark rounded-md bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[1180px]">
              <div className="grid grid-cols-[0.95fr_0.95fr_0.7fr_0.7fr_0.95fr_1.1fr] gap-4 px-6 py-3 bg-cream border-b border-cream-dark">
                <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light">Pengiriman</span>
                <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light">Mandor / Supir</span>
                <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light text-right">Total</span>
                <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light">Status</span>
                <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light">Waktu</span>
                <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light text-right">Aksi</span>
              </div>

              {approvedDeliveriesQuery.isLoading && (
                <div className="px-6 py-12 text-center font-sans text-[13px] text-text-light">
                  Memuat pengiriman yang siap diproses...
                </div>
              )}

              {approvedDeliveriesQuery.isError && (
                <div className="px-6 py-12 text-center">
                  <p className="font-sans text-[13px] text-error mb-4">
                    {approvedDeliveriesQuery.error instanceof Error ? approvedDeliveriesQuery.error.message : "Gagal memuat pengiriman."}
                  </p>
                  <Button variant="ghost" className="px-4 py-2 text-[12px]" onClick={() => approvedDeliveriesQuery.refetch()}>
                    Coba lagi
                  </Button>
                </div>
              )}

              {!approvedDeliveriesQuery.isLoading && !approvedDeliveriesQuery.isError && approvedDeliveries.length === 0 && (
                <div className="px-6 py-14 text-center">
                  <h2 className="font-serif text-[24px] text-text-dark">Belum ada pengiriman</h2>
                  <p className="mt-2 font-sans text-[13px] text-text-light">
                    Belum ada pengiriman yang sudah disetujui mandor pada filter saat ini.
                  </p>
                </div>
              )}

              {!approvedDeliveriesQuery.isLoading && !approvedDeliveriesQuery.isError && approvedDeliveries.map((delivery, index) => (
                <div
                  key={delivery.pengirimanId}
                  className={`grid grid-cols-[0.95fr_0.95fr_0.7fr_0.7fr_0.95fr_1.1fr] gap-4 items-center px-6 py-4 ${
                    index < approvedDeliveries.length - 1 ? "border-b border-cream-dark" : ""
                  }`}
                >
                  <div>
                    <p className="font-mono text-[12px] text-text-mid" title={delivery.pengirimanId}>
                      {compactPengirimanId(delivery.pengirimanId)}
                    </p>
                    <p className="mt-1 font-sans text-[11px] text-text-light">
                      {delivery.panenIds?.length ?? 0} item panen
                    </p>
                  </div>

                  <div>
                    <p className="font-sans text-[13px] text-text-dark">{delivery.mandorName ?? delivery.mandorId}</p>
                    <p className="mt-1 font-sans text-[12px] text-text-light">
                      Supir: {delivery.supirName ?? delivery.supirId}
                    </p>
                  </div>

                  <div className="text-right font-sans text-[13px] text-text-dark">
                    {formatWeight(delivery.totalWeight)}
                  </div>

                  <div>
                    <span className={`inline-block px-2.5 py-1 rounded border text-[11px] font-medium ${deliveryStatusClass(delivery.status)}`}>
                      {delivery.status}
                    </span>
                  </div>

                  <div>
                    <p className="font-sans text-[12px] text-text-mid">{formatTimestamp(delivery.timestamp)}</p>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      variant="secondary"
                      className="px-3 py-2 text-[11px]"
                      loading={adminProcessDelivery.isPending}
                      onClick={() => void handleApprove(delivery.pengirimanId, delivery.totalWeight)}
                    >
                      Approve
                    </Button>

                    <Button
                      variant="ghost"
                      className="px-3 py-2 text-[11px]"
                      onClick={() => {
                        setActionState({
                          mode: "PARTIAL",
                          deliveryId: delivery.pengirimanId,
                          totalWeight: delivery.totalWeight,
                        });
                        setReason("");
                        setPartialWeightInput("");
                        setLocalError(null);
                      }}
                    >
                      Partial
                    </Button>

                    <Button
                      variant="danger"
                      className="px-3 py-2 text-[11px]"
                      onClick={() => {
                        setActionState({
                          mode: "REJECTED_ADMIN",
                          deliveryId: delivery.pengirimanId,
                          totalWeight: delivery.totalWeight,
                        });
                        setReason("");
                        setPartialWeightInput("");
                        setLocalError(null);
                      }}
                    >
                      Reject
                    </Button>
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
