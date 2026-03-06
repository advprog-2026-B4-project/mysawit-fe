"use client";

import { useState, useMemo } from "react";
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
  const [success, setSuccess] = useState(false);

  const defaultForm = useMemo(
    () => ({
      name:  user?.name  ?? "",
      email: user?.email ?? "",
      role:  (user?.role ?? "BURUH") as UserRole,
    }),
    [user],
  );

  const [form, setForm] = useState(defaultForm);

  function openEdit() {
    setForm(defaultForm);
    setEditing(true);
  }

  async function handleSave() {
    await editUser.mutateAsync({ userId, payload: form });
    setEditing(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  if (isLoading) return (
    <div className="p-12 text-text-light text-[13px]">Memuat...</div>
  );
  if (!user) return (
    <div className="p-12 text-error text-[13px]">Pengguna tidak ditemukan.</div>
  );

  const belongsToMandor = user.role === "BURUH" && buruhList.some((b) => b.userId === userId);
  const mandorName = belongsToMandor ? (mandors[0]?.name ?? null) : null;

  return (
    <div className="max-w-[680px]">
      {/* Back */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-[12px] tracking-[0.06em] text-text-light no-underline mb-8 uppercase"
      >
        {"<-"} Kembali
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="font-serif text-[34px] font-normal text-text-dark">
              {user.name}
            </h1>
            <RoleBadge role={user.role} />
          </div>
          <p className="text-[13px] font-light text-text-light">
            @{user.username} - {user.email}
          </p>
        </div>
        {user.role !== "ADMIN" && !editing && (
          <Button variant="secondary" onClick={openEdit}>
            Edit Profil
          </Button>
        )}
      </div>

      {success && (
        <div className="px-4 py-3 mb-6 bg-success/[.07] border border-success/[.27] rounded text-[13px] text-success">
          Profil berhasil diperbarui
        </div>
      )}

      {/* Info card */}
      <div className="bg-white border border-cream-dark rounded-md p-8 mb-6">
        <h3 className="font-serif text-[18px] font-normal text-text-dark mb-6 pb-4 border-b border-cream-dark">
          Informasi Akun
        </h3>

        {editing ? (
          <div className="flex flex-col gap-5">
            <Input label="Nama" value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input label="Email" type="email" value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            <div>
              <label className="block mb-2 text-[11px] font-medium tracking-[0.12em] uppercase text-text-mid">
                Peran
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}
                className="w-full px-4 py-[11px] bg-white border border-sand rounded font-sans text-[13px] text-text-dark outline-none"
              >
                {EDITABLE_ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setEditing(false)}>Batal</Button>
              <Button onClick={handleSave} loading={editUser.isPending}>Simpan Perubahan</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {[
              { label: "Nama Lengkap", value: user.name },
              { label: "Username",     value: `@${user.username}` },
              { label: "Email",        value: user.email },
              { label: "Peran",        value: user.role },
              ...(mandorName ? [{ label: "Mandor", value: mandorName }] : []),
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-light mb-1.5">
                  {label}
                </div>
                <div className="text-[14px] font-light text-text-dark">
                  {value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Buruh list (if Mandor) */}
      {user.role === "MANDOR" && (
        <div className="bg-white border border-cream-dark rounded-md p-8">
          <h3 className="font-serif text-[18px] font-normal text-text-dark mb-5 pb-4 border-b border-cream-dark">
            Buruh di Bawah Mandor Ini
          </h3>
          {buruhList.length === 0 ? (
            <p className="text-[13px] font-light text-text-light">
              Belum ada buruh yang ditugaskan.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {buruhList.map((b) => (
                <div key={b.userId} className="flex items-center justify-between px-4 py-3 bg-cream rounded">
                  <div>
                    <div className="text-[13px] font-normal">{b.name}</div>
                    <div className="text-[11px] text-text-light mt-0.5">{b.email}</div>
                  </div>
                  <Link href={`/admin/users/${b.userId}`}>
                    <Button variant="ghost" className="py-[5px] px-3 text-[11px]">Detail</Button>
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
