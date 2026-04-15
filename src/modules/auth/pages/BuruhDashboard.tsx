"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const BuruhDashboard: React.FC = () => {
  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="font-serif text-[34px] text-text-dark mb-1.5">Dashboard Buruh</h1>
        <p className="font-sans text-[13px] text-text-light">
          Akses cepat ke fungsi utama buruh: pencatatan panen dan melihat payroll/wallet.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-cream-dark bg-white rounded-md p-5">
          <p className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light mb-2">Panen</p>
          <h2 className="font-serif text-[24px] text-text-dark mb-2">Catat Hasil Panen</h2>
          <p className="font-sans text-[13px] text-text-mid mb-4">
            Input hasil panen harian sesuai ketentuan role buruh.
          </p>
          <Link href="/buruh/panen/create">
            <Button variant="secondary" className="px-4 py-2 text-[12px]">Buka Form Panen</Button>
          </Link>
        </div>

        <div className="border border-cream-dark bg-white rounded-md p-5">
          <p className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light mb-2">Pembayaran</p>
          <h2 className="font-serif text-[24px] text-text-dark mb-2">Payroll & Wallet</h2>
          <p className="font-sans text-[13px] text-text-mid mb-4">
            Lihat saldo wallet dan riwayat payroll Anda.
          </p>
          <Link href="/buruh/pembayaran">
            <Button variant="secondary" className="px-4 py-2 text-[12px]">Buka Pembayaran</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BuruhDashboard;
