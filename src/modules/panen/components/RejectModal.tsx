'use client';

import React, { useState } from 'react';

interface RejectModalProps {
  panenId: string;
  onConfirm: (panenId: string, reason: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function RejectModal({ panenId, onConfirm, onCancel, isLoading }: RejectModalProps) {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="font-serif text-xl text-text-dark mb-2">Tolak Laporan Panen</h3>
        <p className="text-sm text-gray-500 mb-4">
          Berikan alasan penolakan yang jelas agar buruh dapat memperbaiki laporannya.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Contoh: Berat tidak sesuai dengan hasil timbangan di lapangan."
          rows={4}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
        />
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={() => onConfirm(panenId, reason)}
            disabled={isLoading || reason.trim().length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Memproses...' : 'Tolak'}
          </button>
        </div>
      </div>
    </div>
  );
}