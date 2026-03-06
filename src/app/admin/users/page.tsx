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

export default function AdminUsersPage() {
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
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "36px", fontWeight: 400,
          color: "var(--text-dark)", marginBottom: "6px",
        }}>
          Manajemen Pengguna
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-light)", fontWeight: 300 }}>
          Kelola seluruh akun yang terdaftar dalam sistem MySawit
        </p>
      </div>

      {/* Controls */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "24px", gap: "16px", flexWrap: "wrap",
      }}>
        {/* Search */}
        <input
          placeholder="Cari nama atau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "10px 16px",
            background: "var(--white)",
            border: "1px solid var(--sand)",
            borderRadius: "4px",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "13px", fontWeight: 300,
            color: "var(--text-dark)",
            outline: "none", width: "280px",
          }}
        />

        {/* Role tabs */}
        <div style={{ display: "flex", gap: "4px" }}>
          {ROLE_TABS.map((tab) => (
            <button key={tab.value} onClick={() => setRoleFilter(tab.value)}
              style={{
                padding: "8px 16px", borderRadius: "4px",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "12px", fontWeight: 400,
                letterSpacing: "0.04em", cursor: "pointer",
                border: "1px solid",
                borderColor: roleFilter === tab.value ? "var(--forest)" : "var(--sand)",
                background: roleFilter === tab.value ? "var(--forest)" : "transparent",
                color: roleFilter === tab.value ? "var(--cream)" : "var(--text-mid)",
                transition: "all 0.15s",
              }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: "var(--white)",
        border: "1px solid var(--cream-dark)",
        borderRadius: "6px", overflow: "hidden",
      }}>
        {/* Table header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.5fr auto auto auto",
          padding: "14px 24px",
          borderBottom: "1px solid var(--cream-dark)",
          gap: "16px",
        }}>
          {["Nama", "Email", "Peran", "Status", ""].map((h) => (
            <div key={h} style={{
              fontSize: "10px", fontWeight: 500,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: "var(--text-light)",
            }}>
              {h}
            </div>
          ))}
        </div>

        {isLoading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text-light)", fontSize: "13px" }}>
            Memuat data...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text-light)", fontSize: "13px" }}>
            Tidak ada pengguna ditemukan
          </div>
        ) : (
          filtered.map((user, i) => (
            <div key={user.userId} style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.5fr auto auto auto",
              padding: "16px 24px", gap: "16px",
              alignItems: "center",
              borderBottom: i < filtered.length - 1 ? "1px solid var(--cream-dark)" : "none",
              transition: "background 0.1s",
            }}
              onMouseOver={(e) => (e.currentTarget.style.background = "var(--cream)")}
              onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div>
                <div style={{ fontSize: "14px", fontWeight: 400, color: "var(--text-dark)" }}>
                  {user.name}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-light)", marginTop: "2px" }}>
                  @{user.username}
                </div>
              </div>
              <div style={{ fontSize: "13px", fontWeight: 300, color: "var(--text-mid)" }}>
                {user.email}
              </div>
              <RoleBadge role={user.role} />
              <div style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: "var(--success)",
              }} />
              <div style={{ display: "flex", gap: "8px" }}>
                <Link href={`/admin/users/${user.userId}`}>
                  <Button variant="ghost" style={{ padding: "6px 14px", fontSize: "12px" }}>
                    Detail
                  </Button>
                </Link>
                {user.role === "BURUH" && (
                  <Button variant="secondary" style={{ padding: "6px 14px", fontSize: "12px" }}
                    onClick={() => setAssignTarget(user)}>
                    Tugaskan
                  </Button>
                )}
                {user.role !== "ADMIN" && (
                  <Button variant="danger" style={{ padding: "6px 14px", fontSize: "12px" }}
                    onClick={() => setDeleteTarget(user)}>
                    Hapus
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: "16px", fontSize: "12px", color: "var(--text-light)" }}>
        {filtered.length} pengguna ditampilkan
      </div>

      {/* Assign Modal */}
      {assignTarget && (
        <Modal title={`Tugaskan ${assignTarget.name} ke Mandor`}
          onClose={() => setAssignTarget(null)}
          onConfirm={handleAssign}
          confirmLabel="Tugaskan"
          loading={assignBuruh.isPending}>
          <p style={{ fontSize: "13px", color: "var(--text-mid)", marginBottom: "16px", fontWeight: 300 }}>
            Pilih mandor yang akan mengawasi buruh ini.
          </p>
          <select value={selectedMandor} onChange={(e) => setSelectedMandor(e.target.value)}
            style={{
              width: "100%", padding: "11px 16px",
              background: "var(--white)", border: "1px solid var(--sand)",
              borderRadius: "4px", fontFamily: "'DM Sans', sans-serif",
              fontSize: "13px", fontWeight: 300, color: "var(--text-dark)",
              outline: "none",
            }}>
            <option value="">Pilih mandor...</option>
            {mandors.map((m) => (
              <option key={m.userId} value={m.userId}>{m.name}</option>
            ))}
          </select>
        </Modal>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <Modal title="Hapus Pengguna"
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          confirmLabel="Hapus"
          danger
          loading={deleteUser.isPending}>
          <p style={{ fontSize: "13px", color: "var(--text-mid)", fontWeight: 300 }}>
            Anda yakin ingin menghapus akun{" "}
            <strong style={{ fontWeight: 500, color: "var(--text-dark)" }}>{deleteTarget.name}</strong>?
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
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(26,46,26,0.4)",
      backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100,
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "var(--white)",
        border: "1px solid var(--cream-dark)",
        borderRadius: "8px",
        padding: "32px", width: "420px", maxWidth: "90vw",
        boxShadow: "0 24px 64px rgba(26,46,26,0.18)",
      }}>
        <h3 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "22px", fontWeight: 400,
          color: "var(--text-dark)", marginBottom: "16px",
        }}>
          {title}
        </h3>
        <div style={{ marginBottom: "28px" }}>{children}</div>
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <Button variant="ghost" onClick={onClose}>Batal</Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}