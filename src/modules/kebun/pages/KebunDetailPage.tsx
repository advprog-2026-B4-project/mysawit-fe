"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { KebunUserDTO } from "../api/kebunApi";
import KebunSelectionModal, { type SelectionOption } from "../components/KebunSelectionModal";
import {
    useAssignMandorToKebun,
    useAssignSupirToKebun,
    useKebunBuruhList,
    useKebunDetail,
    useKebunDirectoryUsers,
    useKebunList,
    useKebunMandor,
    useKebunSupirList,
    useKebunUser,
    useMoveMandorToKebun,
    useMoveSupirToKebun,
} from "../hooks/useKebun";
import { extractErrorMessage } from "@/lib/toast";


export default function KebunDetailPage() {
    const { kebunId } = useParams<{ kebunId: string }>();

    const [supirSearch, setSupirSearch] = useState("");
    const [buruhSearch, setBuruhSearch] = useState("");

    const [isAssignMandorOpen, setIsAssignMandorOpen] = useState(false);
    const [isMoveMandorOpen, setIsMoveMandorOpen] = useState(false);
    const [selectedMandorId, setSelectedMandorId] = useState("");
    const [selectedTargetKebunId, setSelectedTargetKebunId] = useState("");

    const [isAssignSupirOpen, setIsAssignSupirOpen] = useState(false);
    const [selectedSupirId, setSelectedSupirId] = useState("");
    const [movingSupir, setMovingSupir] = useState<KebunUserDTO | null>(null);
    const [selectedSupirTargetKebunId, setSelectedSupirTargetKebunId] = useState("");

    const deferredSupirSearch = useDeferredValue(supirSearch.trim());
    const deferredBuruhSearch = useDeferredValue(buruhSearch.trim());

    const { data: kebun, isLoading, error } = useKebunDetail(kebunId);
    const { data: mandorAssignment } = useKebunMandor(kebunId);
    const { data: currentMandor } = useKebunUser(mandorAssignment?.mandorId ?? "");
    const { data: supirList = [], error: supirError } = useKebunSupirList(
        kebunId,
        deferredSupirSearch || undefined,
    );
    const { data: buruhList = [], error: buruhError } = useKebunBuruhList(
        kebunId,
        deferredBuruhSearch || undefined,
        mandorAssignment?.mandorId,
    );

    const { data: mandorOptions = [] } = useKebunDirectoryUsers("MANDOR");
    const { data: supirOptions = [] } = useKebunDirectoryUsers("SUPIR");
    const { data: allKebun = [] } = useKebunList();

    const assignMandor = useAssignMandorToKebun();
    const moveMandor = useMoveMandorToKebun();
    const assignSupir = useAssignSupirToKebun();
    const moveSupir = useMoveSupirToKebun();

    const otherKebunOptions = useMemo(
        () => allKebun.filter((item) => item.kebunId !== kebunId),
        [allKebun, kebunId],
    );

    const currentSupirIds = useMemo(
        () => new Set(supirList.map((supir) => supir.userId)),
        [supirList],
    );

    const assignMandorSelectionOptions: SelectionOption[] = useMemo(
        () =>
            mandorOptions.map((mandor) => ({
                value: mandor.userId,
                label: mandor.name,
                description: `${mandor.email} | @${mandor.username}`,
            })),
        [mandorOptions],
    );

    const assignSupirSelectionOptions: SelectionOption[] = useMemo(
        () =>
            supirOptions
                .filter((supir) => !currentSupirIds.has(supir.userId))
                .map((supir) => ({
                    value: supir.userId,
                    label: supir.name,
                    description: `${supir.email} | @${supir.username}`,
                })),
        [supirOptions, currentSupirIds],
    );

    const targetKebunSelectionOptions: SelectionOption[] = useMemo(
        () =>
            otherKebunOptions.map((item) => ({
                value: item.kebunId,
                label: item.nama,
                description: `${item.kode} | ${item.luas} Ha`,
            })),
        [otherKebunOptions],
    );

    function openAssignMandorModal() {
        assignMandor.reset();
        setSelectedMandorId("");
        setIsAssignMandorOpen(true);
    }

    function openMoveMandorModal() {
        moveMandor.reset();
        setSelectedTargetKebunId("");
        setIsMoveMandorOpen(true);
    }

    function openAssignSupirModal() {
        assignSupir.reset();
        setSelectedSupirId("");
        setIsAssignSupirOpen(true);
    }

    function openMoveSupirModal(supir: KebunUserDTO) {
        moveSupir.reset();
        setMovingSupir(supir);
        setSelectedSupirTargetKebunId("");
    }

    async function handleAssignMandor() {
        if (!selectedMandorId) return;

        try {
            await assignMandor.mutateAsync({
                mandorId: selectedMandorId,
                kebunId,
            });

            setIsAssignMandorOpen(false);
        } catch {
            // error ditampilkan lewat assignMandor.error
        }
    }

    async function handleMoveMandor() {
        if (!currentMandor || !selectedTargetKebunId) return;

        try {
            await moveMandor.mutateAsync({
                mandorId: currentMandor.userId,
                newKebunId: selectedTargetKebunId,
            });

            setIsMoveMandorOpen(false);
        } catch {
            // error ditampilkan lewat moveMandor.error
        }
    }

    async function handleAssignSupir() {
        if (!selectedSupirId) return;

        try {
            await assignSupir.mutateAsync({
                supirId: selectedSupirId,
                kebunId,
            });

            setIsAssignSupirOpen(false);
        } catch {
            // error ditampilkan lewat assignSupir.error
        }
    }

    async function handleMoveSupir() {
        if (!movingSupir || !selectedSupirTargetKebunId) return;

        try {
            await moveSupir.mutateAsync({
                supirId: movingSupir.userId,
                newKebunId: selectedSupirTargetKebunId,
            });

            setMovingSupir(null);
        } catch {
            // error ditampilkan lewat moveSupir.error
        }
    }

    if (isLoading) {
        return <div className="p-12 text-[13px] text-text-light">Memuat detail kebun...</div>;
    }

    if (error || !kebun) {
        return (
            <div className="p-12 text-[13px] text-error">
                {error ? extractErrorMessage(error, "Terjadi kesalahan yang tidak diketahui") : "Detail kebun tidak ditemukan."}
            </div>
        );
    }

    return (
        <div>
            <Link
                href="/admin/kebun"
                className="mb-8 inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.06em] text-text-light no-underline"
            >
                {"<-"} Kembali ke daftar kebun
            </Link>

            <div className="mb-10 flex items-start justify-between gap-4">
                <div>
                    <div className="mb-2 flex items-center gap-3">
                        <h1 className="font-serif text-[34px] font-normal text-text-dark">{kebun.nama}</h1>
                        <span className="rounded bg-forest/[.08] px-3 py-1 text-[11px] uppercase tracking-[0.08em] text-forest">
              {kebun.kode}
            </span>
                    </div>
                    <p className="text-[13px] font-light text-text-light">
                        Luas {kebun.luas} Ha | {kebun.coordinates.length} titik koordinat
                    </p>
                </div>
            </div>

            <div className="mb-6 grid grid-cols-[1fr_1fr] gap-6">
                <section className="rounded-md border border-cream-dark bg-white p-8">
                    <h2 className="mb-5 font-serif text-[20px] font-normal text-text-dark">Informasi Kebun</h2>
                    <div className="grid grid-cols-2 gap-5">
                        <InfoItem label="Nama Kebun" value={kebun.nama} />
                        <InfoItem label="Kode Kebun" value={kebun.kode} />
                        <InfoItem label="Luas" value={`${kebun.luas} Ha`} />
                        <InfoItem label="Jumlah Titik" value={`${kebun.coordinates.length} titik`} />
                    </div>
                </section>

                <section className="rounded-md border border-cream-dark bg-white p-8">
                    <h2 className="mb-5 font-serif text-[20px] font-normal text-text-dark">Koordinat Ujung</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {kebun.coordinates.map((coordinate, index) => (
                            <div key={`${coordinate.lat}-${coordinate.lng}`} className="rounded border border-cream-dark bg-cream/60 px-4 py-3">
                                <div className="text-[10px] uppercase tracking-[0.12em] text-text-light">Titik {index + 1}</div>
                                <div className="mt-1 text-[13px] text-text-dark">
                                    ({coordinate.lat}, {coordinate.lng})
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <section className="mb-6 rounded-md border border-cream-dark bg-white p-8">
                <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                        <h2 className="font-serif text-[20px] font-normal text-text-dark">Mandor Kebun</h2>
                        <p className="mt-1 text-[13px] font-light text-text-light">
                            Satu kebun maksimal memiliki satu mandor aktif.
                        </p>
                    </div>

                    {currentMandor ? (
                        <Button variant="secondary" onClick={openMoveMandorModal}>
                            Pindahkan Mandor
                        </Button>
                    ) : (
                        <Button onClick={openAssignMandorModal}>Tugaskan Mandor</Button>
                    )}
                </div>

                {currentMandor ? (
                    <div className="rounded border border-cream-dark bg-cream/50 px-5 py-4">
                        <div className="text-[15px] text-text-dark">{currentMandor.name}</div>
                        <div className="mt-1 text-[12px] text-text-light">
                            {currentMandor.email} | @{currentMandor.username}
                        </div>
                    </div>
                ) : (
                    <div className="rounded border border-dashed border-cream-dark px-5 py-5 text-[13px] text-text-light">
                        Belum ada mandor yang ditugaskan pada kebun ini.
                    </div>
                )}
            </section>

            <section className="mb-6 rounded-md border border-cream-dark bg-white p-8">
                <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                        <h2 className="font-serif text-[20px] font-normal text-text-dark">Daftar Supir Truk</h2>
                        <p className="mt-1 text-[13px] font-light text-text-light">
                            Cari supir berdasarkan nama dan pindahkan supir bila perlu.
                        </p>
                    </div>
                    <Button onClick={openAssignSupirModal}>Tugaskan Supir</Button>
                </div>

                <div className="mb-5 max-w-[320px]">
                    <Input
                        label="Cari Nama Supir"
                        value={supirSearch}
                        onChange={(event) => setSupirSearch(event.target.value)}
                        placeholder="Contoh: Dedi"
                    />
                </div>

                {supirError && (
                    <div className="mb-4 rounded border border-error/25 bg-error/[.06] px-4 py-3 text-[13px] text-error">
                        {getErrorMessage(supirError)}
                    </div>
                )}

                {supirList.length === 0 ? (
                    <div className="rounded border border-dashed border-cream-dark px-5 py-5 text-[13px] text-text-light">
                        Belum ada supir yang terdaftar pada kebun ini.
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {supirList.map((supir) => (
                            <div
                                key={supir.userId}
                                className="flex items-center justify-between rounded border border-cream-dark px-5 py-4"
                            >
                                <div>
                                    <div className="text-[14px] text-text-dark">{supir.name}</div>
                                    <div className="mt-1 text-[12px] text-text-light">
                                        {supir.email} | @{supir.username}
                                    </div>
                                </div>
                                <Button
                                    variant="secondary"
                                    className="px-3.5 py-1.5 text-[12px]"
                                    onClick={() => openMoveSupirModal(supir)}
                                >
                                    Pindahkan
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="rounded-md border border-cream-dark bg-white p-8">
                <div className="mb-5">
                    <h2 className="font-serif text-[20px] font-normal text-text-dark">Daftar Buruh</h2>
                    <p className="mt-1 text-[13px] font-light text-text-light">
                        Ditampilkan berdasarkan relasi buruh dengan mandor kebun ini.
                    </p>
                </div>

                <div className="mb-5 max-w-[320px]">
                    <Input
                        label="Cari Nama Buruh"
                        value={buruhSearch}
                        onChange={(event) => setBuruhSearch(event.target.value)}
                        placeholder="Contoh: Budi"
                    />
                </div>

                {buruhError && (
                    <div className="mb-4 rounded border border-error/25 bg-error/[.06] px-4 py-3 text-[13px] text-error">
                        {getErrorMessage(buruhError)}
                    </div>
                )}

                {buruhList.length === 0 ? (
                    <div className="rounded border border-dashed border-cream-dark px-5 py-5 text-[13px] text-text-light">
                        Belum ada buruh yang tampil untuk kebun ini.
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {buruhList.map((buruh) => (
                            <div
                                key={buruh.userId}
                                className="rounded border border-cream-dark px-5 py-4"
                            >
                                <div className="text-[14px] text-text-dark">{buruh.name}</div>
                                <div className="mt-1 text-[12px] text-text-light">
                                    {buruh.email} | @{buruh.username}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {isAssignMandorOpen && (
                <KebunSelectionModal
                    title="Tugaskan Mandor"
                    description="Pilih mandor yang akan ditugaskan ke kebun ini. Jika mandor sudah punya kebun lain, backend akan menolak."
                    selectedValue={selectedMandorId}
                    placeholder="Pilih mandor..."
                    confirmLabel="Tugaskan"
                    options={assignMandorSelectionOptions}
                    emptyMessage="Belum ada data mandor yang bisa dipilih."
                    loading={assignMandor.isPending}
                    errorMessage={assignMandor.error ? getErrorMessage(assignMandor.error) : undefined}
                    onClose={() => setIsAssignMandorOpen(false)}
                    onChange={setSelectedMandorId}
                    onConfirm={handleAssignMandor}
                />
            )}

            {isMoveMandorOpen && (
                <KebunSelectionModal
                    title="Pindahkan Mandor"
                    description="Mandor saat ini akan dipindahkan ke kebun tujuan yang dipilih."
                    selectedValue={selectedTargetKebunId}
                    placeholder="Pilih kebun tujuan..."
                    confirmLabel="Pindahkan"
                    options={targetKebunSelectionOptions}
                    emptyMessage="Belum ada kebun lain yang bisa dijadikan tujuan."
                    loading={moveMandor.isPending}
                    errorMessage={moveMandor.error ? getErrorMessage(moveMandor.error) : undefined}
                    onClose={() => setIsMoveMandorOpen(false)}
                    onChange={setSelectedTargetKebunId}
                    onConfirm={handleMoveMandor}
                />
            )}

            {isAssignSupirOpen && (
                <KebunSelectionModal
                    title="Tugaskan Supir"
                    description="Pilih supir yang akan ditugaskan ke kebun ini."
                    selectedValue={selectedSupirId}
                    placeholder="Pilih supir..."
                    confirmLabel="Tugaskan"
                    options={assignSupirSelectionOptions}
                    emptyMessage="Belum ada supir yang tersedia untuk dipilih."
                    loading={assignSupir.isPending}
                    errorMessage={assignSupir.error ? getErrorMessage(assignSupir.error) : undefined}
                    onClose={() => setIsAssignSupirOpen(false)}
                    onChange={setSelectedSupirId}
                    onConfirm={handleAssignSupir}
                />
            )}

            {movingSupir && (
                <KebunSelectionModal
                    title={`Pindahkan ${movingSupir.name}`}
                    description="Supir ini akan dipindahkan ke kebun tujuan yang dipilih."
                    selectedValue={selectedSupirTargetKebunId}
                    placeholder="Pilih kebun tujuan..."
                    confirmLabel="Pindahkan"
                    options={targetKebunSelectionOptions}
                    emptyMessage="Belum ada kebun lain yang bisa dijadikan tujuan."
                    loading={moveSupir.isPending}
                    errorMessage={moveSupir.error ? getErrorMessage(moveSupir.error) : undefined}
                    onClose={() => setMovingSupir(null)}
                    onChange={setSelectedSupirTargetKebunId}
                    onConfirm={handleMoveSupir}
                />
            )}
        </div>
    );
}

function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="mb-1.5 text-[10px] uppercase tracking-[0.12em] text-text-light">{label}</div>
            <div className="text-[14px] text-text-dark">{value}</div>
        </div>
    );
}
