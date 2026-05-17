"use client";

import { useState } from "react";
import type { VariabelPokokDTO, VariableKey } from "../api/pembayaranApi";
import { useUpdateVariabelPokok } from "../hooks/useVariabelPokok";

// VariabelPokokCard - single variable row with inline editing

interface VariabelPokokCardProps {
  item: VariabelPokokDTO;
}

function VariabelPokokCard({ item }: VariabelPokokCardProps) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(item.value));
  const [fieldError, setFieldError] = useState<string | null>(null);

  const { mutate, isPending, isSuccess, isError, error, reset } = useUpdateVariabelPokok();

  function handleEdit() {
    setInputValue(String(item.value));
    setFieldError(null);
    reset();
    setEditing(true);
  }

  function handleCancel() {
    setEditing(false);
    setFieldError(null);
    reset();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Number(inputValue);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      setFieldError("Nilai harus berupa bilangan bulat positif.");
      return;
    }
    setFieldError(null);
    mutate(
      { key: item.key as VariableKey, newValue: parsed },
      { onSuccess: () => setEditing(false) }
    );
  }

  return (
    <article className="border border-sand rounded-sm p-8 bg-surface flex flex-col gap-4 transition-shadow hover:shadow-sm">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-sans font-medium tracking-widest uppercase text-gold mb-1">
            {item.key}
          </p>
          <h3 className="font-serif text-xl font-semibold text-text-dark leading-tight">
            {item.label}
          </h3>
          <p className="font-sans text-sm text-text-mid mt-1">{item.description}</p>
        </div>

        {!editing && (
          <button
            type="button"
            onClick={handleEdit}
            className="shrink-0 font-sans text-xs font-medium border border-gold text-gold px-4 py-1.5 rounded-sm
                       hover:bg-gold hover:text-cream transition-colors"
          >
            Ubah
          </button>
        )}
      </header>

      {/* Divider */}
      <div className="h-px bg-sand" />

      {/* Current value or edit form */}
      {editing ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="font-sans text-sm font-medium text-text-mid" htmlFor={`input-${item.key}`}>
            Nilai baru ($ per kg)
          </label>
          <input
            id={`input-${item.key}`}
            type="number"
            min={1}
            step={1}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setFieldError(null);
            }}
            className="font-sans text-sm border border-sand rounded-sm px-4 py-2.5 bg-cream
                       text-text-dark placeholder-text-light focus:outline-none focus:border-gold
                       transition-colors w-full max-w-xs"
            placeholder="Masukkan nilai baru"
            disabled={isPending}
          />
          {fieldError && (
            <p className="font-sans text-xs text-red-600">{fieldError}</p>
          )}
          {isError && (
            <p className="font-sans text-xs text-red-600">
              Gagal memperbarui: {(error as Error).message}
            </p>
          )}
          <div className="flex gap-3 mt-1">
            <button
              type="submit"
              disabled={isPending}
              className="font-sans text-sm font-medium bg-forest text-cream px-6 py-2 rounded-sm
                         hover:bg-opacity-90 disabled:opacity-50 transition-colors"
            >
              {isPending ? "Menyimpan..." : "Simpan"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isPending}
              className="font-sans text-sm font-medium border border-sand text-text-mid px-6 py-2 rounded-sm
                         hover:border-text-mid transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-baseline gap-2">
          <span className="font-sans text-sm text-text-light">$</span>
          <span className="font-serif text-3xl font-semibold text-forest">
            {item.value.toLocaleString("id-ID")}
          </span>
          <span className="font-sans text-sm text-text-light">/ kg</span>
          {isSuccess && (
            <span className="ml-2 font-sans text-xs text-green-700 border border-green-300 bg-green-50 px-2 py-0.5 rounded-sm">
              Tersimpan
            </span>
          )}
        </div>
      )}
    </article>
  );
}

// VariabelPokokEditor - renders all variable cards

interface VariabelPokokEditorProps {
  items:    VariabelPokokDTO[];
  /** Forwarded to each card's aria-label for accessibility. */
  readOnly?: boolean;
}

export default function VariabelPokokEditor({ items, readOnly = false }: VariabelPokokEditorProps) {
  if (readOnly) {
    // Read-only rendering - no edit affordance
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.key}
            className="border border-sand rounded-sm p-8 bg-surface flex flex-col gap-4"
          >
            <div>
              <p className="font-sans text-xs font-medium tracking-widest uppercase text-gold mb-1">
                {item.key}
              </p>
              <h3 className="font-serif text-xl font-semibold text-text-dark">{item.label}</h3>
              <p className="font-sans text-sm text-text-mid mt-1">{item.description}</p>
            </div>
            <div className="h-px bg-sand" />
            <div className="flex items-baseline gap-2">
              <span className="font-sans text-sm text-text-light">$</span>
              <span className="font-serif text-3xl font-semibold text-forest">
                {item.value.toLocaleString("id-ID")}
              </span>
              <span className="font-sans text-sm text-text-light">/ kg</span>
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      {items.map((item) => (
        <VariabelPokokCard key={item.key} item={item} />
      ))}
    </div>
  );
}
