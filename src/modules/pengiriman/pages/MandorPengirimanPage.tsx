"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { getRole, getToken } from "@/lib/api/tokenStorage";
import { compactPengirimanId, deliveryStatusClass, formatTimestamp, formatWeight } from "../components/PengirimanShared";
import {
  useAssignablePanenForMandor,
  useAssignDelivery,
  useMandorActiveDeliveries,
  useMandorApproveDelivery,
  useMandorRejectDelivery,
  useMandorSupirList,
} from "../hooks/usePengiriman";

const MAX_TOTAL_WEIGHT_GRAMS = 400_000;

export default function MandorPengirimanPage() {
  const hasSession = Boolean(getToken());
  const role = getRole();

  const [selectedSupirId, setSelectedSupirId] = useState("");
  const [selectedPanenIds, setSelectedPanenIds] = useState<string[]>([]);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const supirQuery = useMandorSupirList(undefined, {
    enabled: hasSession && role === "MANDOR",
  });
  const panenQuery = useAssignablePanenForMandor({
    enabled: hasSession && role === "MANDOR",
  });
  const activeDeliveriesQuery = useMandorActiveDeliveries({
    enabled: hasSession && role === "MANDOR",
  });

  const assignDelivery = useAssignDelivery();
  const approveDelivery = useMandorApproveDelivery();
  const rejectDelivery = useMandorRejectDelivery();
  const supirList = supirQuery.data ?? [];
  const assignablePanen = panenQuery.data ?? [];
  const activeDeliveries = activeDeliveriesQuery.data ?? [];

  const totalSelectedWeight = useMemo(() => {
    const panenById = new Map(assignablePanen.map((item) => [item.panenId, item.weight]));
    return selectedPanenIds.reduce((sum, panenId) => sum + (panenById.get(panenId) ?? 0), 0);
  }, [assignablePanen, selectedPanenIds]);

  async function handleAssignDelivery(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    if (!selectedSupirId) {
      setLocalError("Pilih supir terlebih dahulu.");
      return;
    }
    if (selectedPanenIds.length === 0) {
      setLocalError("Pilih minimal satu panen yang akan dikirim.");
      return;
    }
    if (totalSelectedWeight > MAX_TOTAL_WEIGHT_GRAMS) {
      setLocalError("Total berat pengiriman tidak boleh melebihi 400 kg.");
      return;
    }

    try {
      await assignDelivery.mutateAsync({
        supirId: selectedSupirId,
        panenIds: selectedPanenIds,
      });
      setSelectedPanenIds([]);
      setLocalError(null);
    } catch {
      // handled in hook
    }
  }

  async function handleApproveDelivery(pengirimanId: string) {
    setLocalError(null);
    try {
      await approveDelivery.mutateAsync(pengirimanId);
    } catch {
      // handled in hook
    }
  }

  async function handleRejectDelivery() {
    /* v8 ignore next 3 -- @preserve */
    if (!rejectTargetId) {
      return;
    }
    if (!rejectReason.trim()) {
      setLocalError("Alasan penolakan wajib diisi.");
      return;
    }

    setLocalError(null);
    try {
      await rejectDelivery.mutateAsync({
        pengirimanId: rejectTargetId,
        reason: rejectReason.trim(),
      });
      setRejectTargetId(null);
      setRejectReason("");
    } catch {
      // handled in hook
    }
  }

  function togglePanenSelection(panenId: string) {
    setSelectedPanenIds((current) =>
      current.includes(panenId)
        ? current.filter((id) => id !== panenId)
        : [...current, panenId]
    );
  }

  if (!hasSession) {
    return (
      <div className="min-h-screen bg-cream px-6 py-12">
        <div className="max-w-3xl mx-auto border border-cream-dark bg-white rounded-md px-8 py-10 text-center">
          <h1 className="font-serif text-[30px] text-text-dark">Kelola Pengiriman</h1>
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-serif text-[36px] text-text-dark">Manajemen Pengiriman</h1>
            <p className="mt-2 font-sans text-[13px] font-light text-text-light">
              Tugaskan supir untuk panen yang sudah disetujui, pantau pengiriman aktif, dan proses approval akhir mandor.
            </p>
          </div>

          <Link href="/mandor/supir">
            <Button variant="ghost" className="px-4 py-2 text-[12px]">
              Kembali ke Supir Kebun
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_1fr]">
          <form onSubmit={handleAssignDelivery} className="border border-cream-dark rounded-md bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif text-[28px] text-text-dark">Tugaskan Pengiriman</h2>
                <p className="mt-1 font-sans text-[13px] text-text-light">
                  Pilih satu supir dan satu atau lebih panen yang sudah disetujui dengan total maksimal 400 kg.
                </p>
              </div>
              <div className="text-right">
                <p className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light">Total Terpilih</p>
                <p className={`font-serif text-[28px] ${totalSelectedWeight > MAX_TOTAL_WEIGHT_GRAMS ? "text-error" : "text-forest"}`}>
                  {formatWeight(totalSelectedWeight)}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <label className="block">
                <span className="block font-sans text-[11px] tracking-[0.08em] uppercase text-text-light mb-2">
                  Pilih Supir
                </span>
                <select
                  value={selectedSupirId}
                  onChange={(event) => setSelectedSupirId(event.target.value)}
                  className="w-full rounded border border-sand bg-cream px-3 py-2 font-sans text-[13px] text-text-dark outline-none focus:border-forest"
                >
                  <option value="">Pilih supir kebun</option>
                  {supirList.map((supir) => (
                    <option key={supir.supirId} value={supir.supirId}>
                      {supir.name} ({supir.username})
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {localError && (
              <p className="mt-4 font-sans text-[13px] text-error">{localError}</p>
            )}

            <div className="mt-6 border border-cream-dark rounded-md overflow-hidden">
              <div className="grid grid-cols-[0.45fr_0.95fr_1.2fr_0.8fr] gap-4 px-4 py-3 bg-cream border-b border-cream-dark">
                <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light">Pilih</span>
                <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light">Buruh</span>
                <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light">Deskripsi</span>
                <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light text-right">Berat</span>
              </div>

              {panenQuery.isLoading && (
                <div className="px-4 py-10 text-center font-sans text-[13px] text-text-light">
                  Memuat panen yang dapat dikirim...
                </div>
              )}

              {panenQuery.isError && (
                <div className="px-4 py-10 text-center">
                  <p className="font-sans text-[13px] text-error mb-4">
                    {panenQuery.error instanceof Error ? panenQuery.error.message : "Gagal memuat panen."}
                  </p>
                  <Button variant="ghost" className="px-4 py-2 text-[12px]" onClick={() => panenQuery.refetch()}>
                    Coba lagi
                  </Button>
                </div>
              )}

              {!panenQuery.isLoading && !panenQuery.isError && assignablePanen.length === 0 && (
                <div className="px-4 py-10 text-center">
                  <p className="font-sans text-[13px] text-text-light">
                    Belum ada panen approved yang siap dikirim.
                  </p>
                </div>
              )}

              {!panenQuery.isLoading && !panenQuery.isError && assignablePanen.map((panen, index) => {
                const selected = selectedPanenIds.includes(panen.panenId);
                return (
                  <label
                    key={panen.panenId}
                    className={`grid grid-cols-[0.45fr_0.95fr_1.2fr_0.8fr] gap-4 items-center px-4 py-3 cursor-pointer ${
                      index < assignablePanen.length - 1 ? "border-b border-cream-dark" : ""
                    } ${selected ? "bg-forest/5" : ""}`}
                  >
                    <div>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => togglePanenSelection(panen.panenId)}
                        className="h-4 w-4 rounded border-sand text-forest focus:ring-forest"
                      />
                    </div>
                    <div>
                      <p className="font-sans text-[13px] text-text-dark">{panen.buruhName}</p>
                      <p className="font-mono text-[11px] text-text-light">{panen.buruhId}</p>
                    </div>
                    <div>
                      <p className="font-sans text-[13px] text-text-dark">{panen.description}</p>
                      <p className="font-sans text-[11px] text-text-light">{formatTimestamp(panen.timestamp)}</p>
                    </div>
                    <div className="text-right font-sans text-[13px] text-text-dark">
                      {formatWeight(panen.weight)}
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                className="px-5 py-2.5 text-[12px]"
                loading={assignDelivery.isPending}
              >
                Tugaskan ke Supir
              </Button>
            </div>
          </form>

          <div className="border border-cream-dark rounded-md bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif text-[28px] text-text-dark">Pengiriman Aktif</h2>
                <p className="mt-1 font-sans text-[13px] text-text-light">
                  Pantau status pengiriman yang sedang berjalan dan proses pengiriman yang sudah tiba.
                </p>
              </div>
              <div className="text-right">
                <p className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light">Aktif</p>
                <p className="font-serif text-[28px] text-forest">{activeDeliveries.length}</p>
              </div>
            </div>

            {rejectTargetId && (
              <div className="mt-5 rounded-md border border-error/35 bg-error/5 p-4">
                <p className="font-sans text-[12px] text-text-mid mb-2">
                  Alasan penolakan untuk pengiriman <span className="font-mono">{rejectTargetId}</span>
                </p>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(event) => setRejectReason(event.target.value)}
                  placeholder="Tuliskan alasan penolakan pengiriman..."
                  className="w-full rounded border border-sand bg-white px-3 py-2.5 font-sans text-[13px] text-text-dark outline-none focus:border-forest"
                />
                <div className="mt-3 flex flex-wrap justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="px-4 py-2 text-[12px]"
                    onClick={() => {
                      setRejectTargetId(null);
                      setRejectReason("");
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    className="px-4 py-2 text-[12px]"
                    loading={rejectDelivery.isPending}
                    onClick={() => void handleRejectDelivery()}
                  >
                    Konfirmasi Tolak
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-5 border border-cream-dark rounded-md overflow-hidden">
              <div className="grid grid-cols-[1fr_0.8fr_0.8fr_0.95fr_1fr] gap-4 px-4 py-3 bg-cream border-b border-cream-dark">
                <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light">Supir</span>
                <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light">Status</span>
                <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light text-right">Total</span>
                <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light">Waktu</span>
                <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light text-right">Aksi</span>
              </div>

              {activeDeliveriesQuery.isLoading && (
                <div className="px-4 py-10 text-center font-sans text-[13px] text-text-light">
                  Memuat pengiriman aktif...
                </div>
              )}

              {activeDeliveriesQuery.isError && (
                <div className="px-4 py-10 text-center">
                  <p className="font-sans text-[13px] text-error mb-4">
                    {activeDeliveriesQuery.error instanceof Error ? activeDeliveriesQuery.error.message : "Gagal memuat pengiriman aktif."}
                  </p>
                  <Button variant="ghost" className="px-4 py-2 text-[12px]" onClick={() => activeDeliveriesQuery.refetch()}>
                    Coba lagi
                  </Button>
                </div>
              )}

              {!activeDeliveriesQuery.isLoading && !activeDeliveriesQuery.isError && activeDeliveries.length === 0 && (
                <div className="px-4 py-10 text-center">
                  <p className="font-sans text-[13px] text-text-light">
                    Belum ada pengiriman aktif saat ini.
                  </p>
                </div>
              )}

              {!activeDeliveriesQuery.isLoading && !activeDeliveriesQuery.isError && activeDeliveries.map((delivery, index) => (
                <div
                  key={delivery.pengirimanId}
                  className={`grid grid-cols-[1fr_0.8fr_0.8fr_0.95fr_1fr] gap-4 items-center px-4 py-3 ${
                    index < activeDeliveries.length - 1 ? "border-b border-cream-dark" : ""
                  }`}
                >
                  <div>
                    <p className="font-sans text-[13px] text-text-dark">{delivery.supirName ?? delivery.supirId}</p>
                    <p className="font-mono text-[11px] text-text-light" title={delivery.pengirimanId}>
                      {compactPengirimanId(delivery.pengirimanId)}
                    </p>
                  </div>

                  <div>
                    <span className={`inline-block px-2.5 py-1 rounded border text-[11px] font-medium ${deliveryStatusClass(delivery.status)}`}>
                      {delivery.status}
                    </span>
                    {delivery.statusReason && (
                      <p className="mt-1 font-sans text-[11px] text-text-light">{delivery.statusReason}</p>
                    )}
                  </div>

                  <div className="text-right font-sans text-[13px] text-text-dark">
                    {formatWeight(delivery.totalWeight)}
                  </div>

                  <div>
                    <p className="font-sans text-[12px] text-text-mid">{formatTimestamp(delivery.timestamp)}</p>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2">
                    <Link href={`/mandor/supir/${delivery.supirId}`}>
                      <Button variant="ghost" className="px-3 py-2 text-[11px]">
                        Detail Supir
                      </Button>
                    </Link>

                    {delivery.status === "TIBA" && (
                      <>
                        <Button
                          variant="secondary"
                          className="px-3 py-2 text-[11px]"
                          loading={approveDelivery.isPending}
                          onClick={() => void handleApproveDelivery(delivery.pengirimanId)}
                        >
                          Setujui
                        </Button>
                        <Button
                          variant="danger"
                          className="px-3 py-2 text-[11px]"
                          onClick={() => {
                            setRejectTargetId(delivery.pengirimanId);
                            setRejectReason("");
                          }}
                        >
                          Tolak
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 font-sans text-[12px] text-text-light">
              Approval mandor akan melanjutkan proses payroll supir secara otomatis setelah pengiriman disetujui.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
