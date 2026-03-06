'use client';

import React, { useState } from 'react';
import { useCreatePanen } from '../hooks/useCreatePanen';
import { useDaftarKebun } from '../hooks/useKebun';
import { CreatePanenRequestDTO } from '../api/panenApi';

export const CreatePanenForm: React.FC = () => {
  const { mutate: createPanen, isPending, error, isSuccess } = useCreatePanen();
  const { data: daftarKebun, isLoading: isKebunLoading } = useDaftarKebun();
  // Local state untuk form
  const [formData, setFormData] = useState<CreatePanenRequestDTO>({
    kebunId: '',
    weight: 0,
    description: '',
    photoUrls: [],
  });
  
  // State sementara untuk input URL foto sebelum dimasukkan ke array
  const [tempPhotoUrl, setTempPhotoUrl] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'weight' ? Number(value) : value,
    }));
  };

  const handleAddPhoto = () => {
    if (tempPhotoUrl.trim() !== '') {
      setFormData((prev) => ({
        ...prev,
        photoUrls: [...prev.photoUrls, tempPhotoUrl.trim()],
      }));
      setTempPhotoUrl('');
    }
  };

  const isValidURL = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Panggil mutasi dari TanStack hook
    createPanen(formData, {
      onSuccess: () => {
        // Reset form setelah sukses
        setFormData({ kebunId: '', weight: 0, description: '', photoUrls: [] });
      }
    });
  };
  
  const showUrlWarning = tempPhotoUrl.length > 0 && !isValidURL(tempPhotoUrl);

  return (
    <div className="max-w-md mx-auto p-4 border rounded shadow-sm">
      <h2 className="text-xl font-bold mb-4">Catat Hasil Panen</h2>

      {isSuccess && (
        <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">
          Berhasil mencatat panen!
        </div>
      )}

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">
          Gagal: {error.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Lokasi Kebun</label>
          <select
            name="kebunId"
            required
            value={formData.kebunId}
            onChange={handleChange}
            disabled={isKebunLoading}
            className="w-full border p-2 rounded bg-white"
          >
            <option value="" disabled>
              {isKebunLoading ? 'Memuat daftar kebun...' : '-- Pilih Lokasi Kebun --'}
            </option>
            {daftarKebun?.map((kebun) => (
              <option key={kebun.kebunId} value={kebun.kebunId}>
                {kebun.nama} ({kebun.kode})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Berat Panen (Kilogram)</label>
          <input
            type="number"
            name="weight"
            required
            min="1"
            value={formData.weight || ''}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Deskripsi</label>
          <textarea
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Foto Bukti (URL)</label>
          <div className="flex gap-2 mb-2">
            <input
              type="url"
              value={tempPhotoUrl}
              onChange={(e) => setTempPhotoUrl(e.target.value)}
              className={`flex-1 border p-2 rounded focus:outline-none ${
                showUrlWarning ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'focus:border-blue-500'
              }`}
              placeholder="https://contoh.com/foto.jpg"
            />
            <button
              type="button"
              onClick={handleAddPhoto}
              disabled={!isValidURL(tempPhotoUrl)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Tambah
            </button>
          </div>
          {showUrlWarning && (
            <p className="text-xs text-red-500 mb-2">Format URL tidak valid.</p>
          )}
          <ul className="list-disc pl-5 text-sm text-gray-600">
            {formData.photoUrls.map((url, idx) => (
              <li key={idx}>{url}</li>
            ))}
          </ul>
        </div>

        <button
          type="submit"
          disabled={isPending || isKebunLoading || !formData.kebunId || formData.photoUrls.length === 0}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? 'Menyimpan...' : 'Simpan Laporan'}
        </button>
      </form>
    </div>
  );
};