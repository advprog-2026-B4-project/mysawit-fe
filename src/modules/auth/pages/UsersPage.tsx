"use client";

import { useState } from "react";
import { useUsers, useDeleteUser, useAssignBuruh } from "@/modules/auth";
import type { UserRole, UserDTO } from "@/modules/auth";
import { RoleBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { notify } from "@/lib/toast";
import Link from "next/link";

const ROLE_TABS: { value: UserRole | ""; label: string }[] = [
  { value: "",       label: "Semua" },
  { value: "ADMIN",  label: "Admin" },
  { value: "MANDOR", label: "Mandor" },
  { value: "BURUH",  label: "Buruh" },
  { value: "SUPIR",  label: "Supir" },
];

export default function UsersPage() {
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [assignTarget, setAssignTarget] = useState<UserDTO | null>(null);
  const [selectedMandor, setSelectedMandor] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<UserDTO | null>(null);

  const { data: users = [], isLoading } = useUsers(roleFilter || undefined);
  const { data: mandors = [] }          = useUsers("MANDOR");
  const deleteUser  = useDeleteUser();
  const assignBuruh = useAssignBuruh();

  const filtered = users;

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteUser.mutateAsync(deleteTarget.userId);
    setDeleteTarget(null);
  }

  async function handleAssign() {
    if (!assignTarget) return;
    if (!selectedMandor) {
      notify.error("Pilih mandor terlebih dahulu.");
      return;
    }
    await assignBuruh.mutateAsync({ buruhId: assignTarget.userId, mandorId: selectedMandor });
    setAssignTarget(null);
    setSelectedMandor("");
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-serif text-[36px] font-normal text-text-dark mb-1.5">
          Manajemen Pengguna
        </h1>
        <p className="text-[13px] text-text-light font-light">
          Kelola seluruh akun yang terdaftar dalam sistem MySawit
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="w-full sm:w-auto overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {ROLE_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setRoleFilter(tab.value)}
                className={`px-4 py-2 rounded font-sans text-[12px] font-normal tracking-[0.04em] cursor-pointer border transition-all duration-150 ${
                  roleFilter === tab.value
                    ? "border-forest bg-forest text-cream"
                    : "border-sand bg-transparent text-text-mid hover:border-forest/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-cream-dark rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[840px]">
            {/* Table header */}
            <div className="grid grid-cols-[minmax(200px,1fr)_minmax(250px,1.6fr)_max-content_max-content] px-6 py-3.5 border-b border-cream-dark gap-3">
              <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-light">Nama</div>
              <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-light">Email</div>
              <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-light text-center">Peran</div>
              <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-light text-right">Aksi</div>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-text-light text-[13px]">Memuat data...</div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-text-light text-[13px]">Tidak ada pengguna ditemukan</div>
            ) : (
              filtered.map((user, i) => (
                <div
                  key={user.userId}
                  className={`grid grid-cols-[minmax(200px,1fr)_minmax(250px,1.6fr)_max-content_max-content] px-6 py-4 gap-3 items-center transition-colors duration-100 hover:bg-cream ${
                    i < filtered.length - 1 ? "border-b border-cream-dark" : ""
                  }`}
                >
                  <div>
                    <div className="text-[14px] font-normal text-text-dark">{user.name}</div>
                    <div className="text-[11px] text-text-light mt-0.5">@{user.username}</div>
                  </div>
                  <div className="text-[13px] font-light text-text-mid break-all">{user.email}</div>
                  <div className="w-fit justify-self-center">
                    <RoleBadge userRole={user.role} />
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Link href={`/admin/users/${user.userId}`}>
                      <Button
                        variant="ghost"
                        className="py-1.5 px-3.5 text-[12px] hover:bg-forest/10 hover:text-forest active:bg-forest/20 transition-all duration-200 shadow-sm hover:shadow-md active:shadow-lg hover:-translate-y-0.5"
                      >
                        Detail
                      </Button>
                    </Link>
                    {user.role === "BURUH" && (
                      <Button
                        variant="secondary"
                        className="py-1.5 px-3.5 text-[12px] hover:bg-gold/10 hover:text-gold active:bg-gold/20 transition-all duration-200 shadow-sm hover:shadow-md active:shadow-lg hover:-translate-y-0.5"
                        onClick={() => setAssignTarget(user)}
                      >
                        Tugaskan
                      </Button>
                    )}
                    {user.role !== "ADMIN" && (
                      <Button
                        variant="danger"
                        className="py-1.5 px-3.5 text-[12px] hover:bg-error/10 hover:text-error active:bg-error/20 transition-all duration-200 shadow-sm hover:shadow-md active:shadow-lg hover:-translate-y-0.5"
                        onClick={() => setDeleteTarget(user)}
                      >
                        Hapus
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 text-[12px] text-text-light">
        {filtered.length} pengguna ditampilkan
      </div>

      {/* Assign Modal */}
      {assignTarget && (
        <Modal
          title={`Tugaskan ${assignTarget.name} ke Mandor`}
          onClose={() => setAssignTarget(null)}
          onConfirm={handleAssign}
          confirmLabel="Tugaskan"
          loading={assignBuruh.isPending}
        >
          <p className="text-[13px] text-text-mid mb-4 font-light">
            Pilih mandor yang akan mengawasi buruh ini.
          </p>
          <select
            value={selectedMandor}
            onChange={(e) => setSelectedMandor(e.target.value)}
            className="w-full px-4 py-[11px] bg-white border border-sand rounded font-sans text-[13px] font-light text-text-dark outline-none"
          >
            <option value="">Pilih mandor...</option>
            {mandors.map((m) => (
              <option key={m.userId} value={m.userId}>{m.name}</option>
            ))}
          </select>
        </Modal>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <Modal
          title="Hapus Pengguna"
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          confirmLabel="Hapus"
          danger
          loading={deleteUser.isPending}
        >
          <p className="text-[13px] text-text-mid font-light">
            Anda yakin ingin menghapus akun{" "}
            <strong className="font-medium text-text-dark">{deleteTarget.name}</strong>?
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </Modal>
      )}
    </div>
  );
}

// ---- Reusable Modal ----
function Modal({
  title, children, onClose, onConfirm, confirmLabel, danger, loading,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  danger?: boolean;
  loading?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 bg-forest/40 backdrop-blur-sm flex items-center justify-center z-[100]"
      onClick={onClose}
      role="presentation"
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
    >
      {/* oxlint-disable jsx-a11y(click-events-have-key-events,no-noninteractive-element-interactions,prefer-tag-over-role) */}
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="bg-white border border-cream-dark rounded-lg p-8 w-[420px] max-w-[90vw] shadow-[0_24px_64px_rgba(26,46,26,0.18)]"
      >
        <h3 className="font-serif text-[22px] font-normal text-text-dark mb-4">
          {title}
        </h3>
        <div className="mb-7">{children}</div>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose}>Batal</Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
