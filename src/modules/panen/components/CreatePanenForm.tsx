'use client';

import React, { useEffect, useState, useRef, DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useCreatePanen } from '../hooks/useCreatePanen';
import { useCheckPanenToday } from '../hooks/useCheckPanenToday';
import { CreatePanenRequestDTO } from '../api/panenApi';
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
  const { mutate: createPanen, isPending, error } = useCreatePanen();
  const { data: checkPanenToday, isLoading: isChecking, error: checkError } = useCheckPanenToday();
  const { mutateAsync: uploadFiles, isPending: isUploading } = useUploadPanenPhotos();

  const [formData, setFormData] = useState<Omit<CreatePanenRequestDTO, 'kebunId'>>({
    weight: 0,
    description: '',
    photoUrls: [],
  });

  // ✅ Simpan nama file asli juga
  const [photoNames, setPhotoNames] = useState<Map<string, string>>(new Map());
  const [tempPhotoUrl, setTempPhotoUrl] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deletingIdx, setDeletingIdx] = useState<number | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement> | DragEvent<HTMLDivElement>) => {
    let files: File[] = [];

    if ('dataTransfer' in e) {
      files = Array.from(e.dataTransfer.files ?? []);
    } else {
      files = Array.from(e.target.files ?? []);
    }

    if (files.length === 0) return;

    try {
      const urls = await uploadFiles(files);

      // ✅ Simpan mapping: URL -> original filename
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

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (isUploading) return;

    await handleFileChange(e);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
    
    createPanen(formData as CreatePanenRequestDTO, {
      onSuccess: () => {
        console.log('Panen created successfully');
        toast.success('Laporan panen berhasil disimpan!');
        router.back();
      },
      onError: (error) => {
        console.error('Panen creation failed:', error);
      }
    });
  };
  
  const showUrlWarning = tempPhotoUrl.length > 0 && !isValidURL(tempPhotoUrl);

  if (isChecking) {
    return (
      <div className="w-full max-w-[600px] p-8 md:p-12 flex justify-center items-center h-64">
        <p className="text-text-mid text-[13px] animate-pulse">Mengecek status panen hari ini...</p>
      </div>
    );
  }

  // ✅ Show error jika check gagal
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
        <div className="px-6 py-50 bg-[#f0f4f8] border border-sand rounded-lg text-center flex flex-col items-center">
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
          <div
            role="button"
            tabIndex={0}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && !isUploading && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center w-full px-4 py-8 bg-[#f0f4f8] border-2 border-dashed rounded cursor-pointer transition-colors ${
              isUploading
                ? 'opacity-50 cursor-not-allowed border-sand'
                : isDragOver
                ? 'border-forest bg-forest/5'
                : 'border-sand hover:border-forest'
            }`}
          >
            <span className="text-[13px] text-text-mid mb-1">
              {isUploading ? 'Mengupload...' : isDragOver ? 'Lepaskan file di sini' : 'Klik atau seret foto ke sini'}
            </span>
            <span className="text-[11px] text-text-light">JPG, PNG • Maks. 5MB per file</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              multiple
              disabled={isUploading}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {formData.photoUrls.length > 0 && (
            <ul className="mt-3 grid grid-cols-3 gap-3">
              {formData.photoUrls.map((url, idx) => (
                <li key={idx} className="relative group bg-white border border-sand rounded shadow-sm overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setLightboxUrl(url)}
                    className="block w-full h-full focus:outline-none"
                    title="Klik untuk memperbesar"
                  >
                    <img
                      src={url}
                      alt={photoNames.get(url) || getFileNameFromUrl(url)}
                      className={`w-full h-28 object-cover ${deletingIdx === idx ? 'opacity-30' : ''}`}
                    />
                    {deletingIdx === idx && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-forest border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </button>
                  <div className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1 pointer-events-none">
                    <p className="text-[10px] text-white truncate">
                      {photoNames.get(url) || getFileNameFromUrl(url)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRemovePhoto(idx); }}
                    disabled={deletingIdx === idx}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-black/80 rounded text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ✕
                  </button>
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

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[120] bg-forest/70 backdrop-blur-[2px] p-4 sm:p-8"
          onClick={() => setLightboxUrl(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Preview foto"
        >
          <div
            className="max-w-4xl mx-auto h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-md border border-cream-dark shadow-[0_20px_48px_rgba(20,36,20,0.35)] flex-1 min-h-0 flex flex-col">
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-cream-dark">
                <p className="font-sans text-[12px] text-text-mid truncate max-w-[60%]">
                  {photoNames.get(lightboxUrl) || getFileNameFromUrl(lightboxUrl)}
                </p>
                <div className="flex items-center gap-2">
                  <a
                    href={lightboxUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded border border-forest px-3 py-1.5 font-sans text-[11px] text-forest hover:bg-forest/5 transition-colors"
                  >
                    Download
                  </a>
                  <button
                    type="button"
                    onClick={() => setLightboxUrl(null)}
                    className="px-3 py-1.5 rounded border border-sand font-sans text-[11px] text-text-mid hover:bg-cream-dark hover:text-text-dark transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 px-4 py-4 flex items-center justify-center bg-cream/40 overflow-auto">
                <img
                  src={lightboxUrl}
                  alt={photoNames.get(lightboxUrl) || getFileNameFromUrl(lightboxUrl)}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};