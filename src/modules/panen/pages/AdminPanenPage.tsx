'use client';

import Image from 'next/image';
import { useDeferredValue, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { usePanenAdmin } from '../hooks/usePanenList'; 

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui';
}

const STATUS_CONFIG: Record<string, { label: string; dotClass: string }> = {
    PENDING:  { label: 'Menunggu',  dotClass: 'bg-amber-400' },
    APPROVED: { label: 'Disetujui', dotClass: 'bg-emerald-500' }, // Pakai hijau bawaan tema MySawit
    REJECTED: { label: 'Ditolak',   dotClass: 'bg-rose-500' },  // Pakai merah bawaan tema MySawit
};

function StatusBadge({ status }: { status: string }) {
    const config = STATUS_CONFIG[status] || { label: status, dotClass: 'bg-gray-300' };

    return (
        <div className="flex items-center gap-2">
            <span className={`block w-1.5 h-1.5 rounded-full ${config.dotClass}`}></span>
            {/* Teks menggunakan styling yang persis sama dengan row tabel lainnya */}
            <span className="text-[13px] text-text-mid">{config.label}</span>
        </div>
    );
}

export default function AdminPanenPage() {
    const [searchNama, setSearchNama] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState('');

    // Gunakan deferred value agar ketikan tidak lag (seperti di KebunListPage)
    const deferredNama = useDeferredValue(searchNama.trim());

    // Hook ini akan otomatis fetch SEMUA data saat halaman dibuka (karena tidak ada filter wajib)
    const { data: panenList = [], isLoading, error } = usePanenAdmin({
        buruhName: deferredNama || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        status: status || undefined,
    });

    return (
        <div>
            {/* Header */}
            <div className="mb-10 flex items-start justify-between gap-4">
                <div>
                    <h1 className="font-serif text-[36px] font-normal text-text-dark">Monitoring Hasil Panen</h1>
                    <p className="mt-1.5 text-[13px] font-light text-text-light">
                        Pantau seluruh riwayat hasil panen dari semua kebun dan buruh.
                    </p>
                </div>
            </div>

            {/* Filter Bar - Styling mirip KebunListPage */}
            <div className="mb-6 grid grid-cols-[minmax(0,280px)_minmax(0,180px)_minmax(0,180px)_minmax(0,180px)] gap-4 items-end">
                <Input
                    label="Cari Nama Buruh"
                    value={searchNama}
                    onChange={(event) => setSearchNama(event.target.value)}
                    placeholder="Contoh: Budi"
                />
                
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-light">Dari Tanggal</span>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="px-3 py-2 text-[13px] border border-cream-dark rounded focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest transition-colors text-text-dark bg-white h-10"
                    />
                </div>
                
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-light">Sampai Tanggal</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="px-3 py-2 text-[13px] border border-cream-dark rounded focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest transition-colors text-text-dark bg-white h-10"
                    />
                </div>
                
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-light">Status</span>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="px-3 py-2 text-[13px] border border-cream-dark rounded focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest transition-colors text-text-dark bg-white h-10"
                    >
                        <option value="">Semua Status</option>
                        <option value="PENDING">Menunggu</option>
                        <option value="APPROVED">Disetujui</option>
                        <option value="REJECTED">Ditolak</option>
                    </select>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-5 rounded border border-error/25 bg-error/[.06] px-4 py-3 text-[13px] text-error">
                    {getErrorMessage(error)}
                </div>
            )}

            {/* Tabel Data (menggunakan CSS Grid seperti KebunListPage) */}
            <div className="overflow-hidden rounded-md border border-cream-dark bg-white">
                {/* Update Grid Columns menjadi 1.2fr untuk foto */}
                <div className="grid grid-cols-[1fr_1.5fr_0.8fr_1fr_1.5fr_1.2fr] gap-4 border-b border-cream-dark px-6 py-3.5">
                    {["Tanggal", "Nama Buruh", "Berat (Kg)", "Status", "Deskripsi", "Foto Bukti"].map((header) => (
                        <div key={header} className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-light">
                            {header}
                        </div>
                    ))}
                </div>

                {isLoading ? (
                    <div className="py-12 text-center text-[13px] text-text-light">Memuat data panen...</div>
                ) : panenList.length === 0 ? (
                    <div className="py-12 text-center text-[13px] text-text-light">
                        Belum ada data panen yang cocok dengan filter.
                    </div>
                ) : (
                    panenList.map((panen, index) => (
                        <div
                            key={panen.panenId}
                            className={`grid grid-cols-[1fr_1.5fr_0.8fr_1fr_1.5fr_1.2fr] items-center gap-4 px-6 py-4 ${
                                index < panenList.length - 1 ? "border-b border-cream-dark" : ""
                            }`}
                        >
                            <div className="text-[13px] text-text-dark">
                                {new Date(panen.timestamp).toLocaleDateString('id-ID', {
                                    day: 'numeric', month: 'long', year: 'numeric'
                                })}
                            </div>
                            <div className="text-[14px] text-text-dark font-medium">
                                {panen.buruhName}
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
                            
                            {/* Kotak-kotak Preview Foto */}
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
                                            <Image
                                                src={photo.url}
                                                alt="Preview"
                                                width={40}
                                                height={40}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                            />
                                            {/* Overlay halus saat hover */}
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

            <div className="mt-4 text-[12px] text-text-light">{panenList.length} hasil panen ditampilkan</div>
        </div>
    );
}