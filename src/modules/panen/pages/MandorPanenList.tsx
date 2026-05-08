'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { usePanenMandor, useReviewPanen, PanenDTO, GetPanenMandorParams } from '../hooks/usePanenList';


// ─── Helpers ──────────────────────────────────────────────────────────────────

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.';
}

const STATUS_CONFIG: Record<string, { label: string; dotClass: string }> = {
  PENDING:  { label: 'Menunggu',  dotClass: 'bg-amber-400' },
  APPROVED: { label: 'Disetujui', dotClass: 'bg-emerald-500' },
  REJECTED: { label: 'Ditolak',   dotClass: 'bg-rose-500' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || { label: status, dotClass: 'bg-gray-300' };

  return (
      <div className="flex items-center gap-2">
          <span className={`block w-1.5 h-1.5 rounded-full ${config.dotClass}`}></span>
          <span className="text-[13px] text-text-mid">{config.label}</span>
      </div>
  );
}

function RejectDialog({
  panen,
  onConfirm,
  onClose,
  isPending,
}: {
  panen: PanenDTO;
  onConfirm: (panenId: string, reason: string) => void;
  onClose: () => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState('');
  const isValid = reason.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-forest/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[460px] max-w-[92vw] rounded-lg border border-cream-dark bg-white p-8 shadow-[0_24px_64px_rgba(26,46,26,0.18)]"
      >
        <h2 className="font-serif text-[24px] font-normal text-text-dark">Tolak Hasil Panen</h2>
        <p className="mt-2 text-[13px] font-light text-text-light">
          Panen oleh <span className="text-text-mid font-medium">{panen.buruhName}</span> pada {formatDate(panen.timestamp)}.
        </p>

        <div className="mt-6 flex flex-col gap-1.5">
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-light">
            Alasan Penolakan
          </span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Tuliskan alasan penolakan..."
            rows={3}
            className="w-full px-3 py-2.5 text-[13px] border border-cream-dark rounded focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest transition-colors text-text-dark resize-none"
          />
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Batal</Button>
          <Button
            variant="danger"
            disabled={!isValid || isPending}
            loading={isPending}
            onClick={() => onConfirm(panen.panenId, reason.trim())}
          >
            Tolak Panen
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MandorPanenList() {
  const [buruhNameInput, setBuruhNameInput] = useState('');
  const [dateInput, setDateInput]           = useState('');
  const [appliedFilters, setAppliedFilters] = useState<GetPanenMandorParams>({});

  const [rejectTarget, setRejectTarget] = useState<PanenDTO | null>(null);

  const { data: listPanen = [], isLoading, error } = usePanenMandor(appliedFilters);
  const { mutate: reviewPanen, isPending } = useReviewPanen();

  const handleApplyFilter = () => {
    setAppliedFilters({
      buruhName: buruhNameInput.trim() || undefined,
      date:      dateInput            || undefined,
    });
  };

  const handleResetFilter = () => {
    setBuruhNameInput('');
    setDateInput('');
    setAppliedFilters({});
  };

  const handleApprove = (panenId: string) => {
    reviewPanen({ panenId, data: { action: 'APPROVE' } });
  };

  const handleRejectConfirm = (panenId: string, reason: string) => {
    reviewPanen(
      { panenId, data: { action: 'REJECT', rejectionReason: reason } },
      { onSuccess: () => setRejectTarget(null) }
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-[36px] font-normal text-text-dark">Daftar Panen</h1>
          <p className="mt-1.5 text-[13px] font-light text-text-light">
            Pantau dan validasi hasil panen buruh di kebun Anda.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div className="w-[280px]">
          <Input
            label="Cari Nama Buruh"
            value={buruhNameInput}
            onChange={(e) => setBuruhNameInput(e.target.value)}
            placeholder="Contoh: Budi"
          />
        </div>

        <div className="flex flex-col gap-1 w-[180px]">
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-light">
            Tanggal
          </span>
          <input
            type="date"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="px-3 py-2 text-[13px] border border-cream-dark rounded focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest transition-colors text-text-dark bg-white h-10"
          />
        </div>

        <div className="flex items-center gap-2 h-10">
          <Button onClick={handleApplyFilter} className="h-full">Terapkan</Button>
          <Button variant="ghost" onClick={handleResetFilter} className="h-full">Reset</Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-5 rounded border border-error/25 bg-error/[.06] px-4 py-3 text-[13px] text-error">
          {getErrorMessage(error)}
        </div>
      )}

      {/* Tabel Data */}
      <div className="overflow-hidden rounded-md border border-cream-dark bg-white">
        {/* Update urutan dan Grid Columns agar sejajar dengan desain Admin */}
        <div className="grid grid-cols-[1fr_1.2fr_0.8fr_1fr_1.5fr_1fr_140px] gap-4 border-b border-cream-dark px-6 py-3.5">
          {['Tanggal', 'Nama Buruh', 'Berat (Kg)', 'Status', 'Deskripsi', 'Foto Bukti', 'Aksi'].map((header) => (
            <div
              key={header}
              className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-light"
            >
              {header}
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-[13px] text-text-light">
            Memuat data panen...
          </div>
        ) : listPanen.length === 0 ? (
          <div className="py-12 text-center text-[13px] text-text-light">
            Belum ada data panen yang cocok dengan filter.
          </div>
        ) : (
          listPanen.map((panen, index) => (
            <div
              key={panen.panenId}
              className={`grid grid-cols-[1fr_1.2fr_0.8fr_1fr_1.5fr_1fr_140px] items-center gap-4 px-6 py-4 ${
                index < listPanen.length - 1 ? 'border-b border-cream-dark' : ''
              }`}
            >
              <div className="text-[13px] text-text-dark">
                {formatDate(panen.timestamp)}
              </div>

              <div>
                <Link
                  href={`/mandor/profileburuh/${panen.buruhId}`}
                  className="text-[14px] text-forest font-medium hover:underline transition-colors"
                >
                  {panen.buruhName}
                </Link>
              </div>

              <div className="text-[13px] text-text-mid font-medium">
                {panen.weight.toLocaleString('id-ID')}
              </div>

              <div>
                <StatusBadge status={panen.status} />
              </div>

              <div className="text-[13px] text-text-light truncate" title={panen.description}>
                {panen.description}
              </div>

              {/* Kotak-kotak Preview Foto (Sama dengan AdminPanenPage) */}
              <div className="flex flex-wrap gap-1.5">
                  {panen.photos && panen.photos.length > 0 ? (
                      panen.photos.map((photo) => (
                          <a
                              key={photo.photoId}
                              href={photo.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group relative block w-10 h-10 rounded border border-cream-dark overflow-hidden hover:border-forest transition-all"
                          >
                              <img
                                  src={photo.url}
                                  alt="Preview"
                                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-forest/0 group-hover:bg-forest/10 transition-colors" />
                          </a>
                      ))
                  ) : (
                      <span className="text-[12px] text-text-light">—</span>
                  )}
              </div>

              {/* Kolom Aksi */}
              <div className="flex gap-2">
                {panen.status === 'PENDING' ? (
                  <>
                    <Button
                      variant="primary"
                      className="px-3 py-1.5 text-[11px]"
                      disabled={isPending}
                      onClick={() => handleApprove(panen.panenId)}
                    >
                      Setujui
                    </Button>
                    <Button
                      variant="danger"
                      className="px-3 py-1.5 text-[11px]"
                      disabled={isPending}
                      onClick={() => setRejectTarget(panen)}
                    >
                      Tolak
                    </Button>
                  </>
                ) : (
                  <span className="text-[12px] text-text-light">—</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 text-[12px] text-text-light">
        {listPanen.length} laporan ditampilkan
      </div>

      {/* Modal tolak */}
      {rejectTarget && (
        <RejectDialog
          panen={rejectTarget}
          onConfirm={handleRejectConfirm}
          onClose={() => setRejectTarget(null)}
          isPending={isPending}
        />
      )}
    </div>
  );
}