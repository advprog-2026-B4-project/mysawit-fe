import Link from 'next/link';
import React from 'react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-[500px] p-8 md:p-12 bg-white border border-sand rounded-lg shadow-sm text-center flex flex-col items-center">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-forest/10 rounded-full flex items-center justify-center">
            <span className="text-forest text-3xl">🌿</span>
          </div>
        </div>
        <h1 className="font-serif text-[64px] md:text-[80px] leading-none text-forest mb-2">404</h1>
        <h2 className="font-serif text-[20px] md:text-[24px] text-text-dark mb-3">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-[13px] font-light text-text-mid max-w-[90%] md:max-w-[80%] mb-8">
          Maaf, halaman yang Anda cari tidak tersedia, telah dipindahkan, atau Anda tidak memiliki izin untuk mengaksesnya.
        </p>
        
        <Link 
          href="/"
          className="w-full sm:w-auto py-[11px] px-8 bg-forest text-white rounded font-sans text-[13px] font-medium transition-colors hover:opacity-90 flex items-center justify-center"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
