"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export interface SelectionOption {
    value: string;
    label: string;
    description?: string;
}

interface KebunSelectionModalProps {
    title: string;
    description: string;
    selectedValue: string;
    placeholder: string;
    confirmLabel: string;
    options: SelectionOption[];
    emptyMessage: string;
    loading?: boolean;
    errorMessage?: string;
    onClose: () => void;
    onChange: (value: string) => void;
    onConfirm: () => Promise<void> | void;
}

export default function KebunSelectionModal({
                                                title,
                                                description,
                                                selectedValue,
                                                placeholder,
                                                confirmLabel,
                                                options,
                                                emptyMessage,
                                                loading = false,
                                                errorMessage,
                                                onClose,
                                                onChange,
                                                onConfirm,
                                            }: KebunSelectionModalProps) {
    
    const [search, setSearch] = useState("");

    const filteredOptions = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return options;

        return options.filter((option) => {
            const searchableText = `${option.label} ${option.description ?? ""}`.toLowerCase();
            return searchableText.includes(query);
        });
    }, [options, search]);

    const hasOptions = options.length > 0;
    const hasFilteredOptions = filteredOptions.length > 0;

    return (
        <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-forest/40 backdrop-blur-sm"
            onClick={onClose}
            role="presentation"
            onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
        >
            <div
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className="w-[460px] max-w-[92vw] rounded-lg border border-cream-dark bg-white p-8 shadow-[0_24px_64px_rgba(26,46,26,0.18)]"
                // oxlint-disable-next-line jsx-a11y(click-events-have-key-events,no-noninteractive-element-interactions,prefer-tag-over-role)
            >
                <h2 className="font-serif text-[24px] font-normal text-text-dark">{title}</h2>
                <p className="mt-2 text-[13px] font-light text-text-light">{description}</p>

                {errorMessage && (
                    <div className="mt-5 rounded border border-error/25 bg-error/[.06] px-4 py-3 text-[13px] text-error">
                        {errorMessage}
                    </div>
                )}

                <div className="mt-6">
                    {hasOptions ? (
                        <>
                            <Input
                                label="Cari"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder={placeholder}
                            />

                            <div className="mt-4 max-h-[240px] overflow-y-auto rounded border border-cream-dark">
                                {hasFilteredOptions ? (
                                    filteredOptions.map((option, index) => {
                                        const selected = selectedValue === option.value;

                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => onChange(option.value)}
                                                className={`block w-full border-0 px-4 py-3 text-left transition-colors ${
                                                    index < filteredOptions.length - 1 ? "border-b border-cream-dark" : ""
                                                } ${selected ? "bg-forest/[.08]" : "bg-white hover:bg-cream/70"}`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <div className="text-[13px] text-text-dark">{option.label}</div>
                                                        {option.description && (
                                                            <div className="mt-1 text-[11px] text-text-light">
                                                                {option.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {selected && (
                                                        <span className="rounded bg-forest px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-cream">
                                                            Dipilih
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className="px-4 py-5 text-[13px] text-text-light">
                                        Tidak ada pilihan yang cocok dengan pencarian.
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="mt-2 rounded border border-cream-dark bg-cream/60 px-4 py-5 text-[13px] text-text-light">
                            {emptyMessage}
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>
                        Batal
                    </Button>
                    <Button onClick={onConfirm} loading={loading} disabled={!hasOptions || !selectedValue}>
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}