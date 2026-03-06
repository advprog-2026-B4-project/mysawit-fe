"use client";

import { useState } from "react";
import { useUsers, useDeleteUser, useAssignBuruh } from "@/modules/auth";
import type { UserRole, UserDTO } from "@/modules/auth";
import { RoleBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
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
  const [search, setSearch]         = useState("");
  const [assignTarget, setAssignTarget] = useState<UserDTO | null>(null);
  const [selectedMandor, setSelectedMandor] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<UserDTO | null>(null);

  const { data: users = [], isLoading } = useUsers(roleFilter || undefined);
  const { data: mandors = [] }          = useUsers("MANDOR");
  const deleteUser  = useDeleteUser();
  const assignBuruh = useAssignBuruh();

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteUser.mutateAsync(deleteTarget.userId);
    setDeleteTarget(null);
  }

  async function handleAssign() {
    if (!assignTarget || !selectedMandor) return;
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
        <input
          placeholder="Cari nama atau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2.5 bg-white border border-sand rounded font-sans text-[13px] font-light text-text-dark outline-none w-[280px] focus:border-forest-mid transition-colors"
        />
        <div className="flex gap-1">
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

      {/* Table */}
      <div className="bg-white border border-cream-dark rounded-md overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_1.5fr_auto_auto_auto] px-6 py-3.5 border-b border-cream-dark gap-4">
          {["Nama", "Email", "Peran", "Status", ""].map((h) => (
            <div key={h} className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-light">
              {h}
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-text-light text-[13px]">Memuat data...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-text-light text-[13px]">Tidak ada pengguna ditemukan</div>
        ) : (
          filtered.map((user, i) => (
            <div
              key={user.userId}
              className={`grid grid-cols-[1fr_1.5fr_auto_auto_auto] px-6 py-4 gap-4 items-center transition-colors duration-100 hover:bg-cream ${
                i < filtered.length - 1 ? "border-b border-cream-dark" : ""
              }`}
            >
              <div>
                <div className="text-[14px] font-normal text-text-dark">{user.name}</div>
                <div className="text-[11px] text-text-light mt-0.5">@{user.username}</div>
              </div>
              <div className="text-[13px] font-light text-text-mid">{user.email}</div>
              <RoleBadge role={user.role} />
              <div className="w-2 h-2 rounded-full bg-success" />
              <div className="flex gap-2">
                <Link href={`/admin/users/${user.userId}`}>
                  <Button variant="ghost" className="py-1.5 px-3.5 text-[12px]">Detail</Button>
                </Link>
                {user.role === "BURUH" && (
                  <Button variant="secondary" className="py-1.5 px-3.5 text-[12px]" onClick={() => setAssignTarget(user)}>
                    Tugaskan
                  </Button>
                )}
                {user.role !== "ADMIN" && (
                  <Button variant="danger" className="py-1.5 px-3.5 text-[12px]" onClick={() => setDeleteTarget(user)}>
                    Hapus
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
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
    >
      <div
        onClick={(e) => e.stopPropagation()}
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
