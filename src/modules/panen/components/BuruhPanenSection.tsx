'use client';

import React, { useState } from 'react';
import { usePanenByBuruh } from '../hooks/usePanenList';
import { GetPanenByBuruhParams } from '../api/panenApi';

interface BuruhPanenSectionProps {
  buruhId: string;
}

const STATUS_OPTIONS = ['', 'PENDING', 'APPROVED', 'REJECTED'];

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
      <div className="animate-pulse space-y-3">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        <div className="h-48 bg-gray-100 rounded-lg"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
        <p className="font-semibold">Gagal memuat data panen.</p>
        <p className="text-sm">{error?.message}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-serif text-2xl text-text-dark mb-4">
        Riwayat Panen — <span className="text-forest">{buruhName}</span>
      </h2>

      <div className="flex flex-wrap gap-3 mb-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Dari Tanggal</label>
          <input
            type="date"
            value={startDateInput}
            onChange={(e) => setStartDateInput(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Sampai Tanggal</label>
          <input
            type="date"
            value={endDateInput}
            onChange={(e) => setEndDateInput(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Status</label>
          <select
            value={statusInput}
            onChange={(e) => setStatusInput(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s || 'Semua'}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
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
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Deskripsi</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Berat (Kg)</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {!listPanen || listPanen.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                  Belum ada data panen.
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
                  <td className="px-6 py-4 text-sm text-gray-600">{panen.description}</td>
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}