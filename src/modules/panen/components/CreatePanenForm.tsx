'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
// ✅ Import useCurrentUser
import { useCurrentUser } from '@/modules/auth/hooks/useUsers'; 
import { useCreatePanen } from '../hooks/useCreatePanen';
import { useCheckPanenToday } from '../hooks/useCheckPanenToday'; 
import { type CreatePanenRequestDTO } from '../api/panenApi';
import { useUploadPanenPhotos } from '../hooks/useUploadPanen';
import { storageApi } from '@/lib/api/storageApi';

const getFileNameFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    return pathname.split('/').pop() || url;
  } catch {
    return url;
  }
};

export const CreatePanenForm: React.FC = () => {
  const router = useRouter();
  
  // ✅ Panggil data user yang sedang login
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  
  const { mutate: createPanen, isPending, error } = useCreatePanen();
  const { data: checkPanenToday, isLoading: isChecking, error: checkError } = useCheckPanenToday();
  const { mutateAsync: uploadFiles, isPending: isUploading } = useUploadPanenPhotos();

  const [formData, setFormData] = useState<Omit<CreatePanenRequestDTO, 'kebunId'>>({
    weight: 0,
    description: '',
    photoUrls: [],
  });

  const [photoNames, setPhotoNames] = useState<Map<string, string>>(new Map());
  const [deletingIdx, setDeletingIdx] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'weight' ? Number(value) : value,
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    
    try {
      const urls = await uploadFiles(files);
      
      const newNames = new Map(photoNames);
      files.forEach((file, idx) => {
        newNames.set(urls[idx], file.name);
      });
      setPhotoNames(newNames);

      setFormData((prev) => ({
        ...prev,
        photoUrls: [...prev.photoUrls, ...urls],
      }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload gagal');
    }
  };

  const handleRemovePhoto = async (indexToRemove: number) => {
    const urlToRemove = formData.photoUrls[indexToRemove];
    setDeletingIdx(indexToRemove);

    try {
      const urlObj = new URL(urlToRemove);
      const fileKey = urlObj.pathname.replace(/^\//, '');
      await storageApi.deleteFile(fileKey);
    } catch (e) {
      // Non-fatal: file may not exist in R2 yet
      console.warn('Gagal menghapus file dari R2:', e);
    }

    const newNames = new Map(photoNames);
    newNames.delete(urlToRemove);
    setPhotoNames(newNames);

    setFormData((prev) => ({
      ...prev,
      photoUrls: prev.photoUrls.filter((_, index) => index !== indexToRemove),
    }));
    setDeletingIdx(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createPanen({ ...formData, weight: formData.weight * 1000 } as CreatePanenRequestDTO, {
      onSuccess: () => {
        toast.success('Laporan panen berhasil disimpan!');
        router.back();
      },
      onError: (error) => {
        console.error('Panen creation failed:', error);
      }
    });
  };

  // ✅ Gabungkan loading state user dan check panen
  if (isChecking || isUserLoading) {
    return (
      <div className="w-full max-w-[600px] p-8 md:p-12 flex justify-center items-center h-64">
        <p className="text-text-mid text-[13px] animate-pulse">Memuat data...</p>
      </div>
    );
  }

  // ✅ GUARD 1: Blokir jika tidak punya Mandor
  if (user && !user.mandorId) {
    return (
      <div className="w-full max-w-[600px] p-8 md:p-12">
        <div className="px-6 py-10 bg-red-50 border border-red-200 rounded-lg text-center flex flex-col items-center">
          <h2 className="font-serif text-[24px] text-red-700 mb-2">Akses Ditolak</h2>
          <p className="text-[13px] text-red-600 max-w-[80%] mb-6">
            Anda belum ditugaskan ke Mandor mana pun. Silakan hubungi Admin untuk mendapatkan penugasan sebelum dapat mencatat laporan panen.
          </p>
          <button 
            onClick={() => router.back()}
            className="py-[9px] px-6 bg-white border border-red-200 rounded font-sans text-[13px] font-medium text-red-700 hover:bg-red-50 transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (checkError) {
    return (
      <div className="w-full max-w-[600px] p-8 md:p-12">
        <div className="px-6 py-6 bg-red-50 border border-red-200 rounded-lg text-center">
          <h2 className="font-serif text-[20px] text-red-700 mb-2">Gagal Verifikasi</h2>
          <p className="text-[13px] text-red-600 mb-4">
            {checkError instanceof Error ? checkError.message : 'Tidak dapat memverifikasi panen harian'}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="py-[9px] px-6 bg-white border border-red-200 rounded font-sans text-[13px] font-medium text-red-700 hover:bg-red-50 transition-colors"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  if (checkPanenToday) {
    return (
      <div className="w-full max-w-[600px] p-8 md:p-12">
        <div className="px-6 py-10 bg-[#f0f4f8] border border-sand rounded-lg text-center flex flex-col items-center">
          <h2 className="font-serif text-[24px] text-text-dark mb-2">Sudah Tercatat</h2>
          <p className="text-[13px] text-text-mid max-w-[80%] mb-6">
            Anda sudah mencatat hasil panen untuk hari ini. Anda hanya bisa mengirimkan satu laporan per hari.
          </p>
          <button 
            onClick={() => router.back()}
            className="py-[9px] px-6 bg-white border border-sand rounded font-sans text-[13px] font-medium text-text-dark hover:border-forest transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  // Form normal (belum submit)
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

      {error && (
        <div className="mb-8 px-4 py-3 bg-error/[.07] border border-error/[.27] rounded text-[13px] text-error">
          Gagal: {error.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
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
            Foto Bukti
          </label>
          <label className={`flex flex-col items-center justify-center w-full px-4 py-8 bg-[#f0f4f8] border-2 border-dashed border-sand rounded cursor-pointer hover:border-forest transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <span className="text-[13px] text-text-mid mb-1">
              {isUploading ? 'Mengupload...' : 'Klik untuk pilih foto'}
            </span>
            <span className="text-[11px] text-text-light">JPG, PNG • Maks. 5MB per file</span>
            <input
              type="file"
              accept="image/jpeg,image/png"
              multiple
              disabled={isUploading}
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {formData.photoUrls.length > 0 && (
            <ul className="mt-3 grid grid-cols-2 gap-3">
              {formData.photoUrls.map((url, idx) => (
                <li key={idx} className="relative group rounded overflow-hidden border border-sand bg-white shadow-sm">
                  <img
                    src={url}
                    alt={photoNames.get(url) || getFileNameFromUrl(url)}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent px-3 py-2 flex items-end justify-between">
                    <span className="text-white text-[11px] truncate max-w-[70%]">
                      {photoNames.get(url) || getFileNameFromUrl(url)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      disabled={deletingIdx === idx}
                      className="text-white text-[11px] font-medium bg-error/80 hover:bg-error px-2 py-0.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                      {deletingIdx === idx ? '...' : 'Hapus'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="w-full h-px bg-sand my-4" />

        <button
          type="submit"
          disabled={isPending || isUploading || formData.photoUrls.length === 0}
          className="w-full py-[11px] px-6 bg-forest text-white rounded font-sans text-[13px] font-medium transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isPending ? 'Menyimpan...' : isUploading ? 'Mengupload...' : 'Simpan Laporan'}
        </button>

      </form>
    </div>
  );
};
