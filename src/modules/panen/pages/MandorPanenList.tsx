'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePanenMandor, useReviewPanen } from '../hooks/usePanenList';
import { GetPanenMandorParams } from '../api/panenApi';
import RejectModal from '../components/RejectModal';

// ✅ Helper: Open photo in new tab
const openPhoto = (url: string) => {
  window.open(url, '_blank');
};

export default function MandorPanenList() {
  const [filters, setFilters] = useState<GetPanenMandorParams>({});
  const [buruhNameInput, setBuruhNameInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [rejectingPanenId, setRejectingPanenId] = useState<string | null>(null);

  const { data: listPanen, isLoading, isError, error } = usePanenMandor(filters);
  const { mutate: reviewPanen, isPending } = useReviewPanen();

  const handleApplyFilter = () => {
    setFilters({
      buruhName: buruhNameInput.trim() || undefined,
      date: dateInput || undefined,
    });
  };

  const handleResetFilter = () => {
    setBuruhNameInput('');
    setDateInput('');
    setFilters({});
  };

  const handleApprove = (panenId: string) => {
    reviewPanen({ panenId, data: { action: 'APPROVE' } });
  };

  const handleRejectConfirm = (panenId: string, reason: string) => {
    reviewPanen(
      { panenId, data: { action: 'REJECT', rejectionReason: reason } },
      { onSuccess: () => setRejectingPanenId(null) }
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
        <div className="h-64 bg-gray-100 rounded-lg"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-5xl p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
        <p className="font-semibold">Gagal memuat data panen.</p>
        <p className="text-sm">{error?.message}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      {rejectingPanenId && (
        <RejectModal
          panenId={rejectingPanenId}
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectingPanenId(null)}
          isLoading={isPending}
        />
      )}

      <div className="mb-8">
        <h1 className="font-serif text-[34px] text-text-dark mb-1.5">Daftar Panen</h1>
        <p className="font-sans text-[13px] text-text-light">Pantau hasil panen buruh Anda.</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <input
          type="text"
          placeholder="Cari nama buruh..."
          value={buruhNameInput}
          onChange={(e) => setBuruhNameInput(e.target.value)}
          className="flex-1 min-w-[180px] px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          type="date"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={handleApplyFilter}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
        >
          Terapkan
        </button>
        <button
          onClick={handleResetFilter}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Reset
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Waktu Laporan</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Buruh</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Deskripsi</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Berat (Kg)</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              {/* ✅ Kolom Foto Bukti */}
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Foto Bukti</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {!listPanen || listPanen.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                  Belum ada data panen yang dilaporkan.
                </td>
              </tr>
            ) : (
              listPanen.map((panen) => (
                <tr key={panen.panenId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(panen.timestamp).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/mandor/profileburuh/${panen.buruhId}`}
                      className="text-green-600 hover:text-green-800 hover:underline transition-colors"
                    >
                      {panen.buruhName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {panen.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                    {panen.weight}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
                      panen.status.toUpperCase() === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                      panen.status.toUpperCase() === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                      {panen.status}
                    </span>
                  </td>
                  {/* ✅ Kolom Foto Bukti */}
                  <td className="px-6 py-4 text-center">
                    {panen.photos && panen.photos.length > 0 ? (
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        {panen.photos.map((photo, idx) => (
                          <button
                            key={photo.photoId || idx}
                            onClick={() => openPhoto(photo.url)}
                            className="px-2.5 py-1 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Lihat {idx + 1}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {panen.status.toUpperCase() === 'PENDING' ? (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleApprove(panen.panenId)}
                          disabled={isPending}
                          className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          Setujui
                        </button>
                        <button
                          onClick={() => setRejectingPanenId(panen.panenId)}
                          disabled={isPending}
                          className="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          Tolak
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}