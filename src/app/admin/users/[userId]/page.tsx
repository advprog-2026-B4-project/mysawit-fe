"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useUser, useEditUser, useBuruhByMandor, useUsers } from "@/modules/auth";
import type { UserRole } from "@/modules/auth";
import { RoleBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

const EDITABLE_ROLES: UserRole[] = ["MANDOR", "BURUH", "SUPIR"];

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();

  const { data: user, isLoading } = useUser(userId);
  const { data: mandors = [] }    = useUsers("MANDOR");
  const { data: buruhList = [] }  = useBuruhByMandor(
    user?.role === "MANDOR" ? userId : ""
  );
  const editUser = useEditUser();

  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({ name: "", email: "", role: "" as UserRole });
  const [success, setSuccess] = useState(false);

  // Populate form once user data is available — no conditional setState,
  // the effect simply sets form whenever `user` changes.
  useEffect(() => {
    if (!user) return;
    setForm({ name: user.name, email: user.email, role: user.role });
  }, [user]);

  async function handleSave() {
    await editUser.mutateAsync({ userId, payload: form });
    setEditing(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  if (isLoading) return (
    <div style={{ padding: "48px", color: "var(--text-light)", fontSize: "13px" }}>Memuat…</div>
  );
  if (!user) return (
    <div style={{ padding: "48px", color: "var(--error)", fontSize: "13px" }}>Pengguna tidak ditemukan.</div>
  );

  // Find mandor name if buruh
  const mandorName = user.role === "BURUH"
    ? mandors.find((mandor) => buruhList.some((b) => b.userId === userId))?.name ?? null
    : null;

  return (
    <div style={{ maxWidth: "680px" }}>
      {/* Back */}
      <Link href="/admin/users" style={{
        display: "inline-flex", alignItems: "center", gap: "6px",
        fontSize: "12px", letterSpacing: "0.06em",
        color: "var(--text-light)", textDecoration: "none",
        marginBottom: "32px",
        textTransform: "uppercase",
      }}>
        ← Kembali
      </Link>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: "40px",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "34px", fontWeight: 400, color: "var(--text-dark)",
            }}>
              {user.name}
            </h1>
            <RoleBadge role={user.role} />
          </div>
          <p style={{ fontSize: "13px", fontWeight: 300, color: "var(--text-light)" }}>
            @{user.username} · {user.email}
          </p>
        </div>
        {user.role !== "ADMIN" && !editing && (
          <Button variant="secondary" onClick={() => setEditing(true)}>
            Edit Profil
          </Button>
        )}
      </div>

      {success && (
        <div style={{
          padding: "12px 16px", marginBottom: "24px",
          background: "#2e5c2e11", border: "1px solid #2e5c2e44",
          borderRadius: "4px", fontSize: "13px", color: "var(--success)",
        }}>
          Profil berhasil diperbarui
        </div>
      )}

      {/* Info card */}
      <div style={{
        background: "var(--white)",
        border: "1px solid var(--cream-dark)",
        borderRadius: "6px", padding: "32px",
        marginBottom: "24px",
      }}>
        <h3 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "18px", fontWeight: 400, color: "var(--text-dark)",
          marginBottom: "24px", paddingBottom: "16px",
          borderBottom: "1px solid var(--cream-dark)",
        }}>
          Informasi Akun
        </h3>

        {editing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <Input label="Nama" value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input label="Email" type="email" value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            <div>
              <label style={{
                display: "block", marginBottom: "8px",
                fontSize: "11px", fontWeight: 500,
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: "var(--text-mid)",
              }}>
                Peran
              </label>
              <select value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}
                style={{
                  width: "100%", padding: "11px 16px",
                  background: "var(--white)", border: "1px solid var(--sand)",
                  borderRadius: "4px", fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px", color: "var(--text-dark)", outline: "none",
                }}>
                {EDITABLE_ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", gap: "12px", paddingTop: "8px" }}>
              <Button variant="ghost" onClick={() => setEditing(false)}>Batal</Button>
              <Button onClick={handleSave} loading={editUser.isPending}>Simpan Perubahan</Button>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {[
              { label: "Nama Lengkap", value: user.name },
              { label: "Username",     value: `@${user.username}` },
              { label: "Email",        value: user.email },
              { label: "Peran",        value: user.role },
              ...(mandorName ? [{ label: "Mandor", value: mandorName }] : []),
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{
                  fontSize: "10px", fontWeight: 500,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "var(--text-light)", marginBottom: "6px",
                }}>
                  {label}
                </div>
                <div style={{ fontSize: "14px", fontWeight: 300, color: "var(--text-dark)" }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Buruh list (if Mandor) */}
      {user.role === "MANDOR" && (
        <div style={{
          background: "var(--white)",
          border: "1px solid var(--cream-dark)",
          borderRadius: "6px", padding: "32px",
        }}>
          <h3 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "18px", fontWeight: 400, color: "var(--text-dark)",
            marginBottom: "20px", paddingBottom: "16px",
            borderBottom: "1px solid var(--cream-dark)",
          }}>
            Buruh di Bawah Mandor Ini
          </h3>
          {buruhList.length === 0 ? (
            <p style={{ fontSize: "13px", fontWeight: 300, color: "var(--text-light)" }}>
              Belum ada buruh yang ditugaskan.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {buruhList.map((b) => (
                <div key={b.userId} style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  background: "var(--cream)", borderRadius: "4px",
                }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 400 }}>{b.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-light)", marginTop: "2px" }}>{b.email}</div>
                  </div>
                  <Link href={`/admin/users/${b.userId}`}>
                    <Button variant="ghost" style={{ padding: "5px 12px", fontSize: "11px" }}>
                      Detail
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}