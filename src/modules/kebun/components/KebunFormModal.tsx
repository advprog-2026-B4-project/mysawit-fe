"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { CoordinateDTO } from "../api/kebunApi";

interface CoordinateField {
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

const EMPTY_COORDINATES: CoordinateField[] = [
    { lat: "", lng: "" },
    { lat: "", lng: "" },
    { lat: "", lng: "" },
    { lat: "", lng: "" },
];

function toCoordinateFields(coordinates?: CoordinateDTO[]): CoordinateField[] {
    if (!coordinates || coordinates.length !== 4) {
        return EMPTY_COORDINATES;
    }

    return coordinates.map((coordinate) => ({
        lat: String(coordinate.lat),
        lng: String(coordinate.lng),
    }));
}

function isIntegerString(value: string) {
    return /^-?\d+$/.test(value.trim());
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
    const [nama, setNama] = useState("");
    const [kode, setKode] = useState("");
    const [luas, setLuas] = useState("");
    const [coordinates, setCoordinates] = useState<CoordinateField[]>(EMPTY_COORDINATES);
    const [errors, setErrors] = useState<Partial<Record<"nama" | "kode" | "luas" | "coordinates", string>>>({});

    useEffect(() => {
        setNama(initialValue?.nama ?? "");
        setKode(initialValue?.kode ?? "");
        setLuas(initialValue ? String(initialValue.luas) : "");
        setCoordinates(toCoordinateFields(initialValue?.coordinates));
        setErrors({});
    }, [initialValue, mode]);

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

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        setErrors({});

        await onSubmit({
            nama: nama.trim(),
            kode: kode.trim(),
            luas: Number.parseInt(luas, 10),
            coordinates: coordinates.map((coordinate) => ({
                lat: Number.parseInt(coordinate.lat, 10),
                lng: Number.parseInt(coordinate.lng, 10),
            })),
        });
    }

    function updateCoordinate(index: number, field: "lat" | "lng", value: string) {
        setCoordinates((current) =>
            current.map((coordinate, currentIndex) =>
                currentIndex === index ? { ...coordinate, [field]: value } : coordinate,
            ),
        );
    }

    return (
        <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-forest/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                onClick={(event) => event.stopPropagation()}
                className="w-[760px] max-w-[94vw] rounded-lg border border-cream-dark bg-white p-8 shadow-[0_24px_64px_rgba(26,46,26,0.18)]"
            >
                <div className="mb-6">
                    <h2 className="font-serif text-[26px] font-normal text-text-dark">{title}</h2>
                    <p className="mt-1 text-[13px] font-light text-text-light">
                        {mode === "create"
                            ? "Isi data kebun beserta empat titik koordinat ujung kebun."
                            : "Perbarui data kebun. Kode kebun tetap dan tidak bisa diubah."}
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
                    <div className="mb-4">
                        <h3 className="font-serif text-[18px] font-normal text-text-dark">Koordinat Ujung Kebun</h3>
                        <p className="mt-1 text-[12px] font-light text-text-light">
                            Masukkan tepat empat titik dengan format latitude dan longitude bilangan bulat.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {coordinates.map((coordinate, index) => (
                            <div key={`coordinate-${index}`} className="rounded border border-cream-dark bg-cream/50 p-4">
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

                    {errors.coordinates && (
                        <div className="mt-3 text-[12px] text-error">{errors.coordinates}</div>
                    )}
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>
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