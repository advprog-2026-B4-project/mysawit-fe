"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { getRole, getToken } from "@/lib/api/tokenStorage";
import { useMandorSupirList } from "../hooks/usePengiriman";

function isKebunDependencyUnavailable(message?: string) {
  if (!message) {
    return false;
  }
  const normalized = message.toLowerCase();
  return normalized.includes("kebun query dependency is unavailable")
    || normalized.includes("integrasi modul kebun belum siap");
}

export default function MandorSupirPage() {
  const hasSession = Boolean(getToken());
  const role = getRole();

  const [searchInput, setSearchInput] = useState("");
  const [searchNama, setSearchNama] = useState<string | undefined>(undefined);

  const {
    data = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useMandorSupirList(searchNama, {
    enabled: hasSession && role === "MANDOR",
  });

  const dependencyUnavailable = isKebunDependencyUnavailable(error?.message);

  function onSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = searchInput.trim();
    setSearchNama(trimmed === "" ? undefined : trimmed);
  }

  function onResetFilter() {
    setSearchInput("");
    setSearchNama(undefined);
  }

  if (!hasSession) {
    return (
      <div className="min-h-screen bg-cream px-6 py-12">
        <div className="max-w-3xl mx-auto border border-cream-dark bg-white rounded-md px-8 py-10 text-center">
          <h1 className="font-serif text-[30px] text-text-dark">Daftar Supir Kebun</h1>
          <p className="mt-2 font-sans text-sm text-text-light">
            Anda perlu login terlebih dahulu untuk melihat daftar supir kebun.
          </p>
          <div className="mt-6">
            <Link href="/login">
              <Button variant="primary">Masuk</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (role !== "MANDOR") {
    return (
      <div className="min-h-screen bg-cream px-6 py-12">
        <div className="max-w-3xl mx-auto border border-cream-dark bg-white rounded-md px-8 py-10 text-center">
          <h1 className="font-serif text-[30px] text-text-dark">Akses Terbatas</h1>
          <p className="mt-2 font-sans text-sm text-text-light">
            Halaman ini khusus untuk pengguna dengan role MANDOR.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-serif text-[36px] text-text-dark">Supir Kebun Saya</h1>
            <p className="mt-2 font-sans text-[13px] font-light text-text-light">
              Daftar supir truk yang bertugas di kebun yang Anda kelola.
            </p>
          </div>

          <Link href="/mandor/pengiriman">
            <Button variant="secondary" className="px-4 py-2 text-[12px]">
              Kelola Pengiriman
            </Button>
          </Link>
        </div>

        <form
          className="mb-6 rounded-md border border-cream-dark bg-white p-4 flex flex-col gap-3 md:flex-row md:items-end"
          onSubmit={onSearchSubmit}
        >
          <label className="flex-1">
            <span className="block font-sans text-[11px] tracking-[0.08em] uppercase text-text-light mb-2">
              Filter Nama Supir
            </span>
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Contoh: Ega"
              aria-label="Cari supir"
              className="w-full rounded border border-sand bg-cream px-3 py-2 font-sans text-[13px] text-text-dark outline-none focus:border-forest"
            />
          </label>
          <div className="flex gap-2">
            <Button type="submit" variant="primary">Cari</Button>
            <Button type="button" variant="ghost" onClick={onResetFilter}>Reset</Button>
          </div>
        </form>

        <div className="border border-cream-dark rounded-md bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[920px]">
              <div className="grid grid-cols-[1fr_0.9fr_1.25fr_0.8fr] gap-4 px-6 py-3 bg-cream border-b border-cream-dark">
                <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light">Nama</span>
                <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light">Username</span>
                <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light">Email</span>
                <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-text-light text-right">Aksi</span>
              </div>

              {isLoading && (
                <div className="px-6 py-10 text-center font-sans text-[13px] text-text-light">
                  Memuat daftar supir...
                </div>
              )}

              {!isLoading && dependencyUnavailable && (
                <div className="px-6 py-10 text-center">
                  <h2 className="font-serif text-[24px] text-text-dark">Integrasi Belum Siap</h2>
                  <p className="mt-2 font-sans text-[13px] text-text-light">
                    Data supir belum tersedia karena integrasi query modul kebun belum siap.
                  </p>
                  <div className="mt-4">
                    <Button variant="ghost" onClick={() => refetch()}>
                      Coba lagi
                    </Button>
                  </div>
                </div>
              )}

              {!isLoading && !dependencyUnavailable && isError && (
                <div className="px-6 py-10 text-center">
                  <p className="font-sans text-[13px] text-error">
                    {error?.message ?? "Gagal memuat daftar supir."}
                  </p>
                  <div className="mt-4">
                    <Button variant="ghost" onClick={() => refetch()}>
                      Coba lagi
                    </Button>
                  </div>
                </div>
              )}

              {!isLoading && !isError && data.length === 0 && (
                <div className="px-6 py-14 text-center">
                  <h2 className="font-serif text-[24px] text-text-dark">Belum ada supir</h2>
                  <p className="mt-2 font-sans text-[13px] text-text-light">
                    Tidak ada supir yang cocok dengan filter saat ini.
                  </p>
                </div>
              )}

              {!isLoading && !isError && data.map((supir, index) => (
                <div
                  key={supir.supirId}
                  className={`grid grid-cols-[1fr_0.9fr_1.25fr_0.8fr] gap-4 items-center px-6 py-4 ${
                    index < data.length - 1 ? "border-b border-cream-dark" : ""
                  }`}
                >
                  <span className="font-sans text-[13px] text-text-dark">{supir.name}</span>
                  <span className="font-mono text-[12px] text-text-mid">{supir.username}</span>
                  <span className="font-sans text-[13px] text-text-dark break-all">{supir.email}</span>
                  <div className="text-right">
                    <Link href={`/mandor/supir/${supir.supirId}`}>
                      <Button variant="ghost" className="px-4 py-2 text-[12px]">
                        Lihat Profil
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
