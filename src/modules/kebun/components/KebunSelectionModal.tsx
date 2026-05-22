"use client";

import { Button } from "@/components/ui/Button";

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
    const hasOptions = options.length > 0;

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
                            <select
                                value={selectedValue}
                                onChange={(event) => onChange(event.target.value)}
                                className="w-full rounded border border-sand bg-white px-4 py-[11px] text-[13px] text-text-dark outline-none transition-colors focus:border-forest-mid"
                            >
                                <option value="">{placeholder}</option>
                                {options.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <div className="mt-4 max-h-[180px] overflow-y-auto rounded border border-cream-dark">
                                {options.map((option, index) => (
                                    <div
                                        key={option.value}
                                        className={`px-4 py-3 ${index < options.length - 1 ? "border-b border-cream-dark" : ""}`}
                                    >
                                        <div className="text-[13px] text-text-dark">{option.label}</div>
                                        {option.description && (
                                            <div className="mt-1 text-[11px] text-text-light">{option.description}</div>
                                        )}
                                    </div>
                                ))}
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