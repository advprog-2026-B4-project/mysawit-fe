"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { KebunDTO } from "../api/kebunApi";
import {
    useCreateKebun,
    useDeleteKebun,
    useEditKebun,
    useKebunList,
} from "../hooks/useKebun";
import KebunFormModal from "../components/KebunFormModal";

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui";
}

function formatCoordinates(kebun: KebunDTO) {
    return kebun.coordinates
        .map((coordinate) => `(${coordinate.lat}, ${coordinate.lng})`)
        .join(", ");
}

export default function KebunListPage() {
    const [searchNama, setSearchNama] = useState("");
    const [searchKode, setSearchKode] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingKebun, setEditingKebun] = useState<KebunDTO | null>(null);
    const [deletingKebun, setDeletingKebun] = useState<KebunDTO | null>(null);

    const deferredNama = useDeferredValue(searchNama.trim());
    const deferredKode = useDeferredValue(searchKode.trim());

    const { data: kebunList = [], isLoading, error } = useKebunList(
        deferredNama || undefined,
        deferredKode || undefined,
    );

    const createKebun = useCreateKebun();
    const editKebun = useEditKebun();
    const deleteKebun = useDeleteKebun();

    const hasActiveFilters = !!deferredNama || !!deferredKode;

    async function handleCreate(form: {
        nama: string;
        kode: string;
        luas: number;
        coordinates: KebunDTO["coordinates"];
    }) {
        try {
            await createKebun.mutateAsync(form);
            setIsCreateOpen(false);
        } catch {
            // error ditampilkan lewat createKebun.error
        }
    }

    async function handleEdit(form: {
        nama: string;
        kode: string;
        luas: number;
        coordinates: KebunDTO["coordinates"];
    }) {
        if (!editingKebun) return;

        try {
            await editKebun.mutateAsync({
                kebunId: editingKebun.kebunId,
                payload: {
                    nama: form.nama,
                    luas: form.luas,
                    coordinates: form.coordinates,
                },
            });

            setEditingKebun(null);
        } catch {
            // error ditampilkan lewat editKebun.error
        }
    }

    async function handleDelete() {
        if (!deletingKebun) return;

        try {
            await deleteKebun.mutateAsync(deletingKebun.kebunId);
            setDeletingKebun(null);
        } catch {
            // error ditampilkan lewat deleteKebun.error
        }
    }

    function openCreateModal() {
        createKebun.reset();
        setIsCreateOpen(true);
    }

    function openEditModal(kebun: KebunDTO) {
        editKebun.reset();
        setEditingKebun(kebun);
    }

    function openDeleteModal(kebun: KebunDTO) {
        deleteKebun.reset();
        setDeletingKebun(kebun);
    }

    function resetFilters() {
        setSearchNama("");
        setSearchKode("");
    }

    return (
        <div>
            <div className="mb-10 flex items-start justify-between gap-4">
                <div>
                    <h1 className="font-serif text-[36px] font-normal text-text-dark">Manajemen Kebun</h1>
                    <p className="mt-1.5 text-[13px] font-light text-text-light">
                        Kelola kebun sawit, koordinat area, dan akses operasional per kebun.
                    </p>
                </div>
                <Button onClick={openCreateModal}>Tambah Kebun</Button>
            </div>

            <div className="mb-6 rounded-md border border-cream-dark bg-white p-5">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="w-full sm:w-[280px]">
                        <Input
                            label="Cari Nama Kebun"
                            value={searchNama}
                            onChange={(event) => setSearchNama(event.target.value)}
                            placeholder="Contoh: Sei Lestari"
                        />
                    </div>
                    <div className="w-full sm:w-[220px]">
                        <Input
                            label="Cari Kode Kebun"
                            value={searchKode}
                            onChange={(event) => setSearchKode(event.target.value)}
                            placeholder="Contoh: KBN-SL-01"
                        />
                    </div>
                    <Button
                        variant="ghost"
                        onClick={resetFilters}
                        disabled={!hasActiveFilters}
                        className="h-[46px] w-fit px-4"
                    >
                        Reset Filter
                    </Button>
                </div>

                <div className="mt-3 text-[12px] text-text-light">
                    {hasActiveFilters
                        ? `${kebunList.length} hasil untuk filter aktif.`
                        : `${kebunList.length} kebun ditampilkan.`}
                </div>
            </div>

            {error && (
                <div className="mb-5 rounded border border-error/25 bg-error/[.06] px-4 py-3 text-[13px] text-error">
                    {getErrorMessage(error)}
                </div>
            )}

            <div className="hidden overflow-hidden rounded-md border border-cream-dark bg-white lg:block">
                <div className="grid grid-cols-[minmax(0,1.05fr)_minmax(120px,0.55fr)_minmax(90px,0.35fr)_minmax(0,1.35fr)_230px] gap-3 border-b border-cream-dark px-6 py-3.5">
                    {["Nama Kebun", "Kode", "Luas", "Koordinat", ""].map((header) => (
                        <div
                            key={header}
                            className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-light"
                        >
                            {header}
                        </div>
                    ))}
                </div>

                {isLoading ? (
                    <div className="py-12 text-center text-[13px] text-text-light">Memuat data kebun...</div>
                ) : kebunList.length === 0 ? (
                    <div className="py-12 text-center text-[13px] text-text-light">
                        Belum ada kebun yang cocok dengan filter.
                    </div>
                ) : (
                    kebunList.map((kebun, index) => (
                        <div
                            key={kebun.kebunId}
                            className={`grid grid-cols-[minmax(0,1.05fr)_minmax(120px,0.55fr)_minmax(90px,0.35fr)_minmax(0,1.35fr)_230px] items-center gap-3 px-6 py-4 ${
                                index < kebunList.length - 1 ? "border-b border-cream-dark" : ""
                            }`}
                        >
                            <div className="min-w-0">
                                <div className="truncate text-[14px] text-text-dark" title={kebun.nama}>
                                    {kebun.nama}
                                </div>
                            </div>
                            <div className="min-w-0 truncate text-[13px] text-text-mid" title={kebun.kode}>
                                {kebun.kode}
                            </div>
                            <div className="min-w-0 whitespace-nowrap text-[13px] text-text-mid">
                                {kebun.luas} Ha
                            </div>
                            <div
                                className="min-w-0 truncate text-[12px] leading-5 text-text-light"
                                title={formatCoordinates(kebun)}
                            >
                                {formatCoordinates(kebun)}
                            </div>

                            <div className="flex min-w-0 justify-end gap-2">
                                <Link href={`/admin/kebun/${kebun.kebunId}`}>
                                    <Button variant="ghost" className="px-3 py-1.5 text-[12px]">
                                        Detail
                                    </Button>
                                </Link>
                                <Button
                                    variant="secondary"
                                    className="px-3 py-1.5 text-[12px]"
                                    onClick={() => openEditModal(kebun)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="danger"
                                    className="px-3 py-1.5 text-[12px]"
                                    onClick={() => openDeleteModal(kebun)}
                                >
                                    Hapus
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="space-y-3 lg:hidden">
                {isLoading ? (
                    <div className="rounded-md border border-cream-dark bg-white py-10 text-center text-[13px] text-text-light">
                        Memuat data kebun...
                    </div>
                ) : kebunList.length === 0 ? (
                    <div className="rounded-md border border-cream-dark bg-white py-10 text-center text-[13px] text-text-light">
                        {hasActiveFilters ? "Tidak ada kebun yang cocok dengan filter." : "Belum ada kebun yang dibuat."}
                    </div>
                ) : (
                    kebunList.map((kebun) => (
                        <div key={kebun.kebunId} className="rounded-md border border-cream-dark bg-white p-5">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="text-[15px] text-text-dark">{kebun.nama}</div>
                                    <div className="mt-1 text-[12px] text-text-light">{kebun.kode}</div>
                                </div>
                                <div className="rounded bg-forest/[.08] px-3 py-1 text-[11px] text-forest">
                                    {kebun.luas} Ha
                                </div>
                            </div>

                            <div className="mt-4 rounded border border-cream-dark bg-cream/50 px-4 py-3">
                                <div className="text-[12px] leading-5 text-text-light">
                                    {formatCoordinates(kebun)}
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap justify-end gap-2">
                                <Link href={`/admin/kebun/${kebun.kebunId}`}>
                                    <Button variant="ghost" className="px-3.5 py-1.5 text-[12px]">
                                        Detail
                                    </Button>
                                </Link>
                                <Button
                                    variant="secondary"
                                    className="px-3.5 py-1.5 text-[12px]"
                                    onClick={() => openEditModal(kebun)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="danger"
                                    className="px-3.5 py-1.5 text-[12px]"
                                    onClick={() => openDeleteModal(kebun)}
                                >
                                    Hapus
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isCreateOpen && (
                <KebunFormModal
                    mode="create"
                    title="Tambah Kebun Sawit"
                    submitLabel="Simpan Kebun"
                    loading={createKebun.isPending}
                    errorMessage={createKebun.error ? getErrorMessage(createKebun.error) : undefined}
                    onClose={() => setIsCreateOpen(false)}
                    onSubmit={handleCreate}
                />
            )}

            {editingKebun && (
                <KebunFormModal
                    key={editingKebun.kebunId}
                    mode="edit"
                    title={`Edit ${editingKebun.nama}`}
                    submitLabel="Simpan Perubahan"
                    loading={editKebun.isPending}
                    errorMessage={editKebun.error ? getErrorMessage(editKebun.error) : undefined}
                    initialValue={editingKebun}
                    onClose={() => setEditingKebun(null)}
                    onSubmit={handleEdit}
                />
            )}

            {deletingKebun && (
                <ConfirmDialog
                    title="Hapus Kebun"
                    description={`Anda yakin ingin menghapus kebun ${deletingKebun.nama}? Proses ini akan gagal jika kebun masih memiliki mandor terikat.`}
                    confirmLabel="Hapus Kebun"
                    loading={deleteKebun.isPending}
                    errorMessage={deleteKebun.error ? getErrorMessage(deleteKebun.error) : undefined}
                    onClose={() => setDeletingKebun(null)}
                    onConfirm={handleDelete}
                />
            )}
        </div>
    );
}

function ConfirmDialog({
                           title,
                           description,
                           confirmLabel,
                           loading,
                           errorMessage,
                           onClose,
                           onConfirm,
                       }: {
    title: string;
    description: string;
    confirmLabel: string;
    loading?: boolean;
    errorMessage?: string;
    onClose: () => void;
    onConfirm: () => Promise<void> | void;
}) {
    return (
        <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-forest/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                onClick={(event) => event.stopPropagation()}
                className="w-[460px] max-w-[92vw] rounded-lg border border-cream-dark bg-white p-8 shadow-[0_24px_64px_rgba(26,46,26,0.18)]"
            >
                <h2 className="font-serif text-[24px] font-normal text-text-dark">{title}</h2>
                <p className="mt-2 text-[13px] font-light text-text-light">{description}</p>

                {errorMessage && (
                    <div className="mt-5 rounded border border-error/25 bg-error/[.06] px-4 py-3 text-[13px] text-error">
                        {errorMessage}
                    </div>
                )}

                <div className="mt-8 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>
                        Batal
                    </Button>
                    <Button variant="danger" onClick={onConfirm} loading={loading}>
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}