'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { usePanenByBuruh, type GetPanenByBuruhParams } from '../hooks/usePanenList';

interface BuruhPanenSectionProps {
  buruhId: string;
}

const STATUS_OPTIONS = ['', 'PENDING', 'APPROVED', 'REJECTED'];

const STATUS_OPTIONS_LABEL: Record<string, string> = {
  '': 'Semua Status',
  PENDING: 'Menunggu',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
};

const STATUS_CONFIG: Record<string, { label: string; dotClass: string }> = {
  PENDING:  { label: 'Menunggu',  dotClass: 'bg-amber-400' },
  APPROVED: { label: 'Disetujui', dotClass: 'bg-emerald-500' },
  REJECTED: { label: 'Ditolak',   dotClass: 'bg-rose-500' },
};

function StatusBadge({ status }: { status: string }) {
  const upperStatus = status.toUpperCase();
  const config = STATUS_CONFIG[upperStatus] || { label: status, dotClass: 'bg-gray-300' };

  return (
      <div className="flex items-center gap-2">
          <span className={`block w-1.5 h-1.5 rounded-full ${config.dotClass}`}></span>
          <span className="text-[13px] text-text-mid">{config.label}</span>
      </div>
  );
}

export default function BuruhPanenSection({ buruhId }: BuruhPanenSectionProps) {
  const [filters, setFilters] = useState<GetPanenByBuruhParams>({});
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');
  const [statusInput, setStatusInput] = useState('');

  const { data: listPanen, isLoading, isError, error } = usePanenByBuruh(buruhId, filters);

  const buruhName = Array.isArray(listPanen) && listPanen.length > 0 
    ? listPanen[0].buruhName 
    : 'Buruh';

  const handleApplyFilter = () => {
    setFilters({
      startDate: startDateInput || undefined,
      endDate: endDateInput || undefined,
      status: statusInput || undefined,
    });
  };

  const handleResetFilter = () => {
    setStartDateInput('');
    setEndDateInput('');
    setStatusInput('');
    setFilters({});
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center text-[13px] text-text-light">
        Memuat data panen...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mb-5 rounded border border-error/25 bg-error/[.06] px-4 py-3 text-[13px] text-error">
        {error instanceof Error ? error.message : 'Gagal memuat data panen.'}
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-serif text-[24px] font-normal text-text-dark mb-6">
        Riwayat Panen — <span className="text-forest">{buruhName}</span>
      </h2>

      {/* Filter */}
      <div className="mb-6 flex flex-wrap items-end gap-4 p-5 rounded-md border border-cream-dark bg-white">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-light">
            Dari Tanggal
          </span>
          <input
            type="date"
            value={startDateInput}
            onChange={(e) => setStartDateInput(e.target.value)}
            className="px-3 py-2 text-[13px] border border-cream-dark rounded focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest transition-colors text-text-dark bg-white"
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-light">
            Sampai Tanggal
          </span>
          <input
            type="date"
            value={endDateInput}
            onChange={(e) => setEndDateInput(e.target.value)}
            className="px-3 py-2 text-[13px] border border-cream-dark rounded focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest transition-colors text-text-dark bg-white"
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-light">
            Status
          </span>
          <select
            value={statusInput}
            onChange={(e) => setStatusInput(e.target.value)}
            className="px-3 py-2 text-[13px] border border-cream-dark rounded focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest transition-colors text-text-dark bg-white"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{STATUS_OPTIONS_LABEL[s] || s}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2">
          <Button onClick={handleApplyFilter}>Terapkan</Button>
          <Button variant="ghost" onClick={handleResetFilter}>Reset</Button>
        </div>
      </div>

      {/* Tabel Data */}
      <div className="overflow-hidden rounded-md border border-cream-dark bg-white">
        <div className="grid grid-cols-[1fr_1.5fr_0.8fr_1fr_1.2fr_1.2fr] gap-4 border-b border-cream-dark px-6 py-3.5">
          {['Tanggal', 'Deskripsi', 'Berat (Kg)', 'Status', 'Keterangan', 'Foto Bukti'].map((h) => (
            <div
              key={h}
              className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-light"
            >
              {h}
            </div>
          ))}
        </div>

        {!listPanen || listPanen.length === 0 ? (
          <div className="py-12 text-center text-[13px] text-text-light">
            Belum ada data panen.
          </div>
        ) : (
          listPanen.map((panen, index) => (
            <div
              key={panen.panenId}
              className={`grid grid-cols-[1fr_1.5fr_0.8fr_1fr_1.2fr_1.2fr] items-center gap-4 px-6 py-4 ${
                index < listPanen.length - 1 ? 'border-b border-cream-dark' : ''
              }`}
            >
              <div className="text-[13px] text-text-dark">
                {new Date(panen.timestamp).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </div>

              <div className="text-[13px] text-text-mid truncate" title={panen.description}>
                {panen.description}
              </div>

              <div className="text-[13px] text-text-mid font-medium">
                {(panen.weight / 1000).toLocaleString('id-ID')}
              </div>

              <div>
                <StatusBadge status={panen.status} />
              </div>

              <div className="text-[13px]">
                {panen.status.toUpperCase() === 'REJECTED' ? (
                  <span className="text-error">{panen.rejectionReason || 'Ditolak'}</span>
                ) : panen.status.toUpperCase() === 'APPROVED' ? (
                  <span className="text-text-light">Disetujui mandor</span>
                ) : (
                  <span className="text-text-light">Menunggu review</span>
                )}
              </div>

              {/* Preview Foto */}
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
            </div>
          ))
        )}
      </div>
      
      {listPanen && listPanen.length > 0 && (
        <div className="mt-4 text-[12px] text-text-light">
          {listPanen.length} laporan ditampilkan
        </div>
      )}
    </div>
  );
}