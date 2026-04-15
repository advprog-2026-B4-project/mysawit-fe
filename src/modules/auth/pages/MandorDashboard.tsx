"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const MandorDashboard: React.FC = () => {
  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="font-serif text-[34px] text-text-dark mb-1.5">Dashboard Mandor</h1>
        <p className="font-sans text-[13px] text-text-light">
          Akses cepat ke fungsi mandor yang sudah tersedia di frontend saat ini.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-cream-dark bg-white rounded-md p-5">
          <p className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light mb-2">Pengiriman</p>
          <h2 className="font-serif text-[24px] text-text-dark mb-2">Supir Kebun</h2>
          <p className="font-sans text-[13px] text-text-mid mb-4">
            Lihat dan filter supir yang bertugas di kebun yang Anda kelola.
          </p>
          <Link href="/mandor/supir">
            <Button variant="secondary" className="px-4 py-2 text-[12px]">Buka Daftar Supir</Button>
          </Link>
        </div>

        <div className="border border-cream-dark bg-white rounded-md p-5">
          <p className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light mb-2">Pembayaran</p>
          <h2 className="font-serif text-[24px] text-text-dark mb-2">Payroll & Wallet</h2>
          <p className="font-sans text-[13px] text-text-mid mb-4">
            Pantau saldo wallet dan riwayat payroll mandor.
          </p>
          <Link href="/mandor/pembayaran">
            <Button variant="secondary" className="px-4 py-2 text-[12px]">Buka Pembayaran</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MandorDashboard;
