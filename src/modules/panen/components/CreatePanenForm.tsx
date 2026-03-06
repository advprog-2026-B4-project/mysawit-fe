'use client';

import React, { useState } from 'react';
import { useCreatePanen } from '../hooks/useCreatePanen';
import { useDaftarKebun } from '../hooks/useKebun';
import { CreatePanenRequestDTO } from '../api/panenApi';

export const CreatePanenForm: React.FC = () => {
  const { mutate: createPanen, isPending, error, isSuccess } = useCreatePanen();
  const { data: daftarKebun, isLoading: isKebunLoading } = useDaftarKebun();
  
  const [formData, setFormData] = useState<CreatePanenRequestDTO>({
    kebunId: '',
    weight: 0,
    description: '',
    photoUrls: [],
  });
  
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

  const handleRemovePhoto = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      photoUrls: prev.photoUrls.filter((_, index) => index !== indexToRemove),
    }));
  };

  const isValidURL = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPanen(formData, {
      onSuccess: () => {
        setFormData({ kebunId: '', weight: 0, description: '', photoUrls: [] });
      }
    });
  };
  
  const showUrlWarning = tempPhotoUrl.length > 0 && !isValidURL(tempPhotoUrl);

  return (
    <div className="w-full max-w-[600px] p-8 md:p-12">
      <div className="mb-10">
        <h1 className="font-serif text-[36px] font-normal text-text-dark mb-2">
          Catat Hasil Panen
        </h1>
        <p className="text-[13px] font-light text-text-light">
          Masukkan detail laporan panen dan lampirkan bukti foto.
        </p>
      </div>

      {isSuccess && (
        <div className="mb-8 px-4 py-3 bg-[#e6f4ea] border border-[#a8dab5] rounded text-[13px] text-[#137333]">
          Berhasil mencatat laporan panen!
        </div>
      )}

      {error && (
        <div className="mb-8 px-4 py-3 bg-error/[.07] border border-error/[.27] rounded text-[13px] text-error">
          Gagal: {error.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-medium text-text-mid uppercase tracking-[0.08em]">
            Lokasi Kebun
          </label>
          <div className="relative">
            <select
              name="kebunId"
              required
              value={formData.kebunId}
              onChange={handleChange}
              disabled={isKebunLoading}
              className="w-full px-4 py-[11px] bg-[#f0f4f8] border border-sand rounded text-[13px] text-text-dark focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest transition-colors appearance-none"
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
            {/* Custom Arrow Icon untuk Dropdown */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text-mid">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-medium text-text-mid uppercase tracking-[0.08em]">
            Berat Panen (Kilogram)
          </label>
          <input
            type="number"
            name="weight"
            required
            min="1"
            value={formData.weight || ''}
            onChange={handleChange}
            placeholder="Contoh: 1500"
            className="w-full px-4 py-[11px] bg-[#f0f4f8] border border-sand rounded text-[13px] text-text-dark focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-medium text-text-mid uppercase tracking-[0.08em]">
            Deskripsi
          </label>
          <textarea
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
            placeholder="Masukkan catatan mengenai panen..."
            rows={3}
            className="w-full px-4 py-[11px] bg-[#f0f4f8] border border-sand rounded text-[13px] text-text-dark focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest transition-colors resize-y"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-medium text-text-mid uppercase tracking-[0.08em]">
            Foto Bukti (URL)
          </label>
          <div className="flex gap-3">
            <input
              type="url"
              value={tempPhotoUrl}
              onChange={(e) => setTempPhotoUrl(e.target.value)}
              placeholder="https://contoh.com/foto.jpg"
              className={`flex-1 px-4 py-[11px] bg-[#f0f4f8] border rounded text-[13px] text-text-dark focus:outline-none transition-colors ${
                showUrlWarning ? 'border-error focus:border-error focus:ring-1 focus:ring-error' : 'border-sand focus:border-forest focus:ring-1 focus:ring-forest'
              }`}
            />
            <button
              type="button"
              onClick={handleAddPhoto}
              disabled={!isValidURL(tempPhotoUrl)}
              className="py-[11px] px-6 bg-white border border-sand rounded font-sans text-[13px] font-medium text-text-mid transition-colors hover:border-forest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tambah
            </button>
          </div>
          
          {showUrlWarning && (
            <p className="text-[11px] text-error mt-0.5">Format URL tidak valid.</p>
          )}

          {formData.photoUrls.length > 0 && (
            <ul className="mt-3 space-y-2">
              {formData.photoUrls.map((url, idx) => (
                <li key={idx} className="flex items-center justify-between py-2.5 px-4 bg-white border border-sand rounded shadow-sm text-[13px] text-text-mid">
                  <span className="truncate w-5/6">{url}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="text-error font-medium hover:opacity-80 transition-opacity"
                  >
                    Hapus
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="w-full h-px bg-sand my-4" />

        <button
          type="submit"
          disabled={isPending || isKebunLoading || !formData.kebunId || formData.photoUrls.length === 0}
          className="w-full py-[11px] px-6 bg-forest text-white rounded font-sans text-[13px] font-medium transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isPending ? 'Menyimpan...' : 'Simpan Laporan'}
        </button>

      </form>
    </div>
  );
};