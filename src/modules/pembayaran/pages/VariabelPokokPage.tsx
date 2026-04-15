"use client";

import { useState } from "react";
import AdminGuard from "@/components/guards/AdminGuard";
import { Button } from "@/components/ui/Button";
import type { VariabelPokokDTO, VariableKey } from "@/modules/pembayaran/api/pembayaranApi";
import {
  useVariabelPokokList,
  useUpdateVariabelPokok,
} from "@/modules/pembayaran/hooks/useVariabelPokok";

// ---- Key badge ----

function KeyBadge({ label }: { label: string }) {
  return (
    <span className="inline-block w-27.5 text-center py-1 font-sans text-[10px] font-medium
                     tracking-[0.15em] uppercase text-gold border border-gold rounded-[3px]">
      {label}
    </span>
  );
}

// ---- Row ----

function VariabelPokokRow({ item }: { item: VariabelPokokDTO }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);

  const { mutate, isPending, isError, error, reset } = useUpdateVariabelPokok();

  function openEdit() {
    setDraft(String(item.value));
    setFieldError(null);
    reset();
    setEditing(true);
  }

  function closeEdit() {
    setEditing(false);
    setFieldError(null);
    reset();
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Number(draft);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      setFieldError("Nilai harus berupa bilangan bulat positif.");
      return;
    }
    mutate(
      { key: item.key as VariableKey, newValue: parsed },
      { onSuccess: () => setEditing(false) },
    );
  }

  if (editing) {
    return (
      <form
        onSubmit={handleSave}
        className="grid grid-cols-[110px_1fr_auto_auto] items-start gap-5 px-6 py-5 bg-surface border-b border-cream-dark last:border-b-0"
      >
        {/* Badge anchor */}
        <div className="pt-0.5">
          <KeyBadge label={item.key} />
        </div>

        <div className="col-span-3">
          <p className="font-sans text-sm font-normal text-text-dark mb-4">{item.label}</p>

          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <label className="block font-sans text-[10px] font-medium tracking-[0.12em] uppercase text-text-light mb-1.5">
                Nilai baru ($ per kg)
              </label>
              <input
                type="number"
                min={1}
                step={1}
                value={draft}
                onChange={(e) => { setDraft(e.target.value); setFieldError(null); }}
                disabled={isPending}
                autoFocus
                className={[
                  "w-40 px-3.5 py-2.5 font-sans text-sm font-light text-text-dark bg-cream",
                  "border rounded-sm outline-none transition-colors",
                  "focus:border-forest-mid",
                  fieldError || isError ? "border-error" : "border-sand",
                  "disabled:opacity-50",
                ].join(" ")}
              />
            </div>
            <div className="flex gap-2 pb-px flex-wrap">
              <Button type="submit" variant="primary" loading={isPending} className="px-5 py-2.5 text-[13px]">
                Simpan
              </Button>
              <Button type="button" variant="ghost" disabled={isPending} onClick={closeEdit} className="px-5 py-2.5 text-[13px]">
                Batal
              </Button>
            </div>
          </div>

          {fieldError && (
            <p className="mt-1.5 font-sans text-xs text-error">{fieldError}</p>
          )}
          {isError && !fieldError && (
            <p className="mt-1.5 font-sans text-xs text-error">
              Gagal memperbarui: {(error as Error).message}
            </p>
          )}
        </div>
      </form>
    );
  }

  return (
    <div className="grid grid-cols-[110px_1fr_auto_auto] items-center gap-5 px-6 py-4.5
                    border-b border-cream-dark last:border-b-0
                    transition-colors hover:bg-cream/60">
      <KeyBadge label={item.key} />

      {/* Label + description */}
      <div>
        <p className="font-sans text-sm font-normal text-text-dark">{item.label}</p>
        <p className="font-sans text-xs font-light text-text-light mt-0.5">{item.description}</p>
      </div>

      {/* Value */}
      <div className="text-right">
        <span className="font-sans text-xs text-text-light mr-0.5">$</span>
        <span className="font-serif text-[26px] font-semibold text-forest leading-none">
          {item.value.toLocaleString("id-ID")}
        </span>
        <span className="font-sans text-xs text-text-light ml-1">/ kg</span>
      </div>

      {/* Edit */}
      <div className="flex justify-end">
        <Button variant="secondary" onClick={openEdit} className="px-4 py-2 text-[12px]">
          Ubah
        </Button>
      </div>
    </div>
  );
}

// ---- Skeleton row ----

function SkeletonRow() {
  return (
    <div className="grid grid-cols-[110px_1fr_auto_auto] items-center gap-5 px-6 py-4.5
                    border-b border-cream-dark last:border-b-0 animate-pulse">
      <div className="h-6 bg-cream-dark rounded-[3px]" />
      <div>
        <div className="h-3.5 w-40 bg-cream-dark rounded mb-1.5" />
        <div className="h-3 w-64 bg-sand/50 rounded" />
      </div>
      <div className="h-7 w-24 bg-cream-dark rounded ml-auto" />
      <div className="flex justify-end">
        <div className="h-8 w-16 bg-cream-dark rounded" />
      </div>
    </div>
  );
}

// ---- Page content ----

function VariabelPokokPageContent() {
  const { data, isLoading, isError, error, refetch } = useVariabelPokokList();

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h2 className="font-serif text-[32px] font-normal text-text-dark mb-1.5">
          Variabel Upah
        </h2>
        <p className="font-sans text-[13px] font-light text-text-light">
          Nilai acuan perhitungan pembayaran buruh, supir, dan mandor. Satuan SawitDollar ($) per kg.
        </p>
      </div>

      {/* Table card */}
      <div className="border border-cream-dark rounded-md bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            {/* Column headers */}
            <div className="grid grid-cols-[110px_1fr_auto_auto] gap-5 px-6 py-3 bg-cream border-b border-cream-dark">
              <span className="font-sans text-[10px] font-medium tracking-[0.12em] uppercase text-text-light">Kode</span>
              <span className="font-sans text-[10px] font-medium tracking-[0.12em] uppercase text-text-light">Variabel</span>
              <span className="font-sans text-[10px] font-medium tracking-[0.12em] uppercase text-text-light text-right">Nilai</span>
              <span className="font-sans text-[10px] font-medium tracking-[0.12em] uppercase text-text-light text-right">Aksi</span>
            </div>

            {isLoading && [0, 1, 2].map((i) => <SkeletonRow key={i} />)}

            {isError && (
              <div className="px-6 py-12 text-center">
                <p className="font-sans text-[13px] font-light text-text-light mb-4">
                  {error instanceof Error ? error.message : "Gagal memuat data."}
                </p>
                <Button variant="ghost" onClick={() => refetch()} className="px-5 py-2 text-[12px]">
                  Coba lagi
                </Button>
              </div>
            )}

            {data?.map((item) => <VariabelPokokRow key={item.key} item={item} />)}
          </div>
        </div>
      </div>

      {data && (
        <p className="mt-3 font-sans text-xs text-text-light text-right">
          {data.length} variabel upah
        </p>
      )}
    </div>
  );
}

// Route export - wrapped in AdminGuard
export default function VariabelPokokPage() {
  return (
    <AdminGuard>
      <VariabelPokokPageContent />
    </AdminGuard>
  );
}

