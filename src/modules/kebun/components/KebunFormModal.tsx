"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { CoordinateDTO } from "../api/kebunApi";

interface CoordinateField {
    id: string;
    lat: string;
    lng: string;
}

interface KebunFormValue {
    nama: string;
    kode: string;
    luas: number;
    coordinates: CoordinateDTO[];
}

interface KebunFormModalProps {
    mode: "create" | "edit";
    title: string;
    submitLabel: string;
    loading?: boolean;
    errorMessage?: string;
    initialValue?: {
        nama: string;
        kode: string;
        luas: number;
        coordinates: CoordinateDTO[];
    };
    onClose: () => void;
    onSubmit: (value: KebunFormValue) => Promise<void> | void;
}

interface KebunFormState {
    nama: string;
    kode: string;
    luas: string;
    coordinates: CoordinateField[];
}

function createEmptyCoordinates(): CoordinateField[] {
    const base = Date.now().toString();
    return [
        { id: `${base}-0`, lat: "", lng: "" },
        { id: `${base}-1`, lat: "", lng: "" },
        { id: `${base}-2`, lat: "", lng: "" },
        { id: `${base}-3`, lat: "", lng: "" },
    ];
}

function toCoordinateFields(coordinates?: CoordinateDTO[]): CoordinateField[] {
    if (!coordinates || coordinates.length !== 4) {
        return createEmptyCoordinates();
    }

    const base = Date.now().toString();
    return coordinates.map((coordinate, idx) => ({
        id: `${base}-${idx}`,
        lat: String(coordinate.lat),
        lng: String(coordinate.lng),
    }));
}

function createInitialFormState(initialValue?: KebunFormModalProps["initialValue"]): KebunFormState {
    return {
        nama: initialValue?.nama ?? "",
        kode: initialValue?.kode ?? "",
        luas: initialValue ? String(initialValue.luas) : "",
        coordinates: toCoordinateFields(initialValue?.coordinates),
    };
}

function isIntegerString(value: string) {
    return /^-?\d+$/.test(value.trim());
}

function isSquareCoordinates(coordinates: CoordinateDTO[]) {
    const latValues = coordinates.map((coordinate) => coordinate.lat);
    const lngValues = coordinates.map((coordinate) => coordinate.lng);

    const minLat = Math.min(...latValues);
    const maxLat = Math.max(...latValues);
    const minLng = Math.min(...lngValues);
    const maxLng = Math.max(...lngValues);

    const expected = new Set([
        `${minLat}:${minLng}`,
        `${minLat}:${maxLng}`,
        `${maxLat}:${minLng}`,
        `${maxLat}:${maxLng}`,
    ]);

    const actual = new Set(coordinates.map((coordinate) => `${coordinate.lat}:${coordinate.lng}`));

    if (actual.size !== 4 || actual.size !== expected.size) {
        return false;
    }

    for (const point of actual) {
        if (!expected.has(point)) {
            return false;
        }
    }

    return maxLat - minLat > 0 &&
        maxLng - minLng > 0 &&
        maxLat - minLat === maxLng - minLng;
}

function parseCoordinateFields(coordinates: CoordinateField[]) {
    if (coordinates.some((coordinate) => !isIntegerString(coordinate.lat) || !isIntegerString(coordinate.lng))) {
        return null;
    }

    return coordinates.map((coordinate) => ({
        lat: Number.parseInt(coordinate.lat, 10),
        lng: Number.parseInt(coordinate.lng, 10),
    }));
}

export default function KebunFormModal({
                                           mode,
                                           title,
                                           submitLabel,
                                           loading = false,
                                           errorMessage,
                                           initialValue,
                                           onClose,
                                           onSubmit,
                                       }: KebunFormModalProps) {
    const initialFormState = createInitialFormState(initialValue);

    const [nama, setNama] = useState(initialFormState.nama);
    const [kode, setKode] = useState(initialFormState.kode);
    const [luas, setLuas] = useState(initialFormState.luas);
    const [coordinates, setCoordinates] = useState<CoordinateField[]>(initialFormState.coordinates);
    const [errors, setErrors] = useState<Partial<Record<"nama" | "kode" | "luas" | "coordinates", string>>>({});

    const parsedCoordinates = parseCoordinateFields(coordinates);
    const isDirty =
        nama !== initialFormState.nama ||
        kode !== initialFormState.kode ||
        luas !== initialFormState.luas ||
        JSON.stringify(coordinates) !== JSON.stringify(initialFormState.coordinates);

    function requestClose() {
        if (!isDirty || window.confirm("Tutup form dan buang perubahan yang belum disimpan?")) {
            onClose();
        }
    }

    async function handleSubmit() {
        const nextErrors: Partial<Record<"nama" | "kode" | "luas" | "coordinates", string>> = {};

        if (!nama.trim()) {
            nextErrors.nama = "Nama kebun wajib diisi";
        }

        if (!kode.trim()) {
            nextErrors.kode = "Kode kebun wajib diisi";
        }

        if (!luas.trim() || !isIntegerString(luas) || Number.parseInt(luas, 10) <= 0) {
            nextErrors.luas = "Luas kebun harus berupa angka bulat lebih dari 0";
        }

        const hasInvalidCoordinate = coordinates.some(
            (coordinate) => !isIntegerString(coordinate.lat) || !isIntegerString(coordinate.lng),
        );

        if (hasInvalidCoordinate) {
            nextErrors.coordinates = "Semua latitude dan longitude harus berupa bilangan bulat";
        }

        const submitCoordinates = parsedCoordinates ?? [];

        if (!hasInvalidCoordinate && !isSquareCoordinates(submitCoordinates)) {
            nextErrors.coordinates = "Koordinat harus membentuk 4 sudut persegi";
        }

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        setErrors({});

        try {
            await onSubmit({
                nama: nama.trim(),
                kode: kode.trim(),
                luas: Number.parseInt(luas, 10),
                coordinates: submitCoordinates,
            });
        } catch {
            // error backend ditampilkan oleh parent lewat errorMessage
        }
    }

    function updateCoordinate(index: number, field: "lat" | "lng", value: string) {
        setCoordinates((current) =>
            current.map((coordinate, currentIndex) =>
                currentIndex === index ? { ...coordinate, [field]: value } : coordinate,
            ),
        );
    }

    function fillExampleSquare() {
        setCoordinates([
            { lat: "0", lng: "0" },
            { lat: "0", lng: "10" },
            { lat: "10", lng: "0" },
            { lat: "10", lng: "10" },
        ]);
        setErrors((current) => ({ ...current, coordinates: undefined }));
    }

    return (
        <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-forest/40 backdrop-blur-sm"
            onClick={onClose}
            role="presentation"
            onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
        >
            {/* oxlint-disable jsx-a11y(click-events-have-key-events,no-noninteractive-element-interactions,prefer-tag-over-role) */}
            <div
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className="w-[760px] max-w-[94vw] rounded-lg border border-cream-dark bg-white p-8 shadow-[0_24px_64px_rgba(26,46,26,0.18)]"
            >
                <div className="mb-6">
                    <h2 className="font-serif text-[26px] font-normal text-text-dark">{title}</h2>
                    <p className="mt-1 text-[13px] font-light text-text-light">
                        {mode === "create"
                            ? "Isi data kebun beserta empat titik sudut kebun berbentuk persegi."
                            : "Perbarui data kebun berbentuk persegi. Kode kebun tetap dan tidak bisa diubah."}
                    </p>
                </div>

                {errorMessage && (
                    <div className="mb-5 rounded border border-error/25 bg-error/[.06] px-4 py-3 text-[13px] text-error">
                        {errorMessage}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-5">
                    <Input
                        label="Nama Kebun"
                        value={nama}
                        onChange={(event) => setNama(event.target.value)}
                        error={errors.nama}
                        placeholder="Contoh: Kebun Sei Lestari"
                    />
                    <Input
                        label="Kode Kebun"
                        value={kode}
                        onChange={(event) => setKode(event.target.value)}
                        error={errors.kode}
                        disabled={mode === "edit"}
                        placeholder="Contoh: KBN-SL-01"
                    />
                    <div className="col-span-2 max-w-[220px]">
                        <Input
                            label="Luas (Ha)"
                            type="number"
                            min={1}
                            value={luas}
                            onChange={(event) => setLuas(event.target.value)}
                            error={errors.luas}
                            placeholder="Contoh: 120"
                        />
                    </div>
                </div>

                <div className="mt-7 border-t border-cream-dark pt-6">
                    <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div>
                            <h3 className="font-serif text-[18px] font-normal text-text-dark">Koordinat Ujung Kebun</h3>
                            <p className="mt-1 text-[12px] font-light text-text-light">
                                Masukkan empat titik sudut persegi. Urutan titik bebas selama sudutnya lengkap.
                            </p>
                        </div>
                        <Button variant="ghost" className="px-3.5 py-1.5 text-[12px]" onClick={fillExampleSquare}>
                            Isi Contoh
                        </Button>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
                        <div className="grid gap-4 sm:grid-cols-2">
                            {coordinates.map((coordinate, index) => (
                                <div key={coordinate.id} className="rounded border border-cream-dark bg-cream/50 p-4">
                                    <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.12em] text-text-mid">
                                        Titik {index + 1}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input
                                            label="Latitude"
                                            value={coordinate.lat}
                                            onChange={(event) => updateCoordinate(index, "lat", event.target.value)}
                                            placeholder="0"
                                        />
                                        <Input
                                            label="Longitude"
                                            value={coordinate.lng}
                                            onChange={(event) => updateCoordinate(index, "lng", event.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <CoordinatePreview coordinates={parsedCoordinates} />
                    </div>

                    {errors.coordinates && (
                        <div className="mt-3 text-[12px] text-error">{errors.coordinates}</div>
                    )}
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <Button variant="ghost" onClick={requestClose}>
                        Batal
                    </Button>
                    <Button onClick={handleSubmit} loading={loading}>
                        {submitLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}

function CoordinatePreview({ coordinates }: { coordinates: CoordinateDTO[] | null }) {
    if (!coordinates || coordinates.length !== 4) {
        return (
            <div className="rounded border border-dashed border-cream-dark bg-white p-4">
                <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-mid">Preview</div>
                <div className="mt-4 flex h-[180px] items-center justify-center rounded bg-cream/50 px-4 text-center text-[12px] leading-5 text-text-light">
                    Preview muncul setelah semua koordinat terisi angka.
                </div>
            </div>
        );
    }

    const latValues = coordinates.map((coordinate) => coordinate.lat);
    const lngValues = coordinates.map((coordinate) => coordinate.lng);
    const minLat = Math.min(...latValues);
    const maxLat = Math.max(...latValues);
    const minLng = Math.min(...lngValues);
    const maxLng = Math.max(...lngValues);
    const latRange = maxLat - minLat;
    const lngRange = maxLng - minLng;
    const validShape = isSquareCoordinates(coordinates);

    return (
        <div className="rounded border border-cream-dark bg-white p-4">
            <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-mid">Preview</div>
                <span className={`rounded px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] ${
                    validShape ? "bg-success/10 text-success" : "bg-error/10 text-error"
                }`}>
                    {validShape ? "Valid" : "Belum valid"}
                </span>
            </div>
            <div className="relative mt-4 h-[180px] rounded border border-cream-dark bg-cream/40">
                {coordinates.map((coordinate, index) => {
                    const left = lngRange === 0 ? 50 : ((coordinate.lng - minLng) / lngRange) * 82 + 9;
                    const top = latRange === 0 ? 50 : 91 - ((coordinate.lat - minLat) / latRange) * 82;

                    return (
                        <div
                            key={`${coordinate.lat}-${coordinate.lng}`}
                            className="absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-forest text-[11px] text-cream"
                            style={{ left: `${left}%`, top: `${top}%` }}
                        >
                            {index + 1}
                        </div>
                    );
                })}
            </div>
            <div className="mt-3 text-[11px] leading-5 text-text-light">
                Lat {minLat}..{maxLat}, Lng {minLng}..{maxLng}
            </div>
        </div>
    );
}