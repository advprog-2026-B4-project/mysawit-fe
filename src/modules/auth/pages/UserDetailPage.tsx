"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useUser, useEditUser, useBuruhByMandor, useUsers } from "@/modules/auth";
import type { UserRole } from "@/modules/auth";
import { DEFAULT_PAYROLL_PAGE_SIZE, type PayrollListFilter } from "@/modules/pembayaran/api/pembayaranApi";
import { usePayrollsByUser } from "@/modules/pembayaran/hooks/usePayroll";
import {
  compactPayrollId,
  formatPayrollDate,
  formatPayrollMoney,
  payrollStatusClass,
  PayrollDetailDialog,
  PayrollPagination,
  resolvePayrollReferenceLink,
} from "@/modules/pembayaran/components/PayrollShared";
import { RoleBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

const EDITABLE_ROLES: UserRole[] = ["MANDOR", "BURUH", "SUPIR"];
const PAYROLL_VISIBLE_ROLES = new Set<UserRole>(["BURUH", "SUPIR"]);

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
  const [payrollStartDate, setPayrollStartDate] = useState("");
  const [payrollEndDate, setPayrollEndDate] = useState("");
  const [payrollPage, setPayrollPage] = useState(0);
  const [selectedPayrollId, setSelectedPayrollId] = useState<string | null>(null);

  const defaultForm = useMemo(
    () => ({
      name:  user?.name  ?? "",
      email: user?.email ?? "",
      role:  (user?.role ?? "BURUH") as UserRole,
    }),
    [user],
  );

  const [form, setForm] = useState(defaultForm);

  const canViewPayrollSection = PAYROLL_VISIBLE_ROLES.has((user?.role ?? "ADMIN") as UserRole);
  const payrollFilter = useMemo<PayrollListFilter>(
    () => ({
      startDate: payrollStartDate || undefined,
      endDate: payrollEndDate || undefined,
      page: payrollPage,
      size: DEFAULT_PAYROLL_PAGE_SIZE,
    }),
    [payrollEndDate, payrollPage, payrollStartDate],
  );
  const payrolls = usePayrollsByUser(
    canViewPayrollSection ? userId : "",
    canViewPayrollSection ? payrollFilter : undefined,
  );
  const payrollItems = useMemo(() => payrolls.data?.items ?? [], [payrolls.data?.items]);
  const selectedPayroll = useMemo(
    () => payrollItems.find((item) => item.payrollId === selectedPayrollId) ?? null,
    [payrollItems, selectedPayrollId],
  );
  const selectedRelationLinks = useMemo(() => {
    if (!selectedPayroll) {
      return [];
    }

    const referenceLink = resolvePayrollReferenceLink(selectedPayroll);
    return [
      {
        label: "Pekerja terkait",
        href: `/admin/users/${selectedPayroll.userId}`,
        value: selectedPayroll.userId,
      },
      {
        label: "Referensi terkait",
        href: referenceLink.href,
        value: selectedPayroll.referenceId,
      },
    ];
  }, [selectedPayroll]);

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
      {canViewPayrollSection && (
        <div className="bg-white border border-cream-dark rounded-md p-8 mb-6">
          <h3 className="font-serif text-[18px] font-normal text-text-dark mb-2 pb-4 border-b border-cream-dark">
            Riwayat Payroll {user.role === "SUPIR" ? "Supir" : "Buruh"}
          </h3>
          <p className="font-sans text-[12px] text-text-light mb-4">
            Gunakan filter tanggal untuk melihat payroll pada rentang waktu tertentu.
          </p>

          <p className="font-sans text-[12px] text-text-light mb-4">
            Klik baris payroll untuk melihat detail perhitungan.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] gap-3 items-end mb-5">
            <label className="block">
              <span className="block text-[10px] font-medium tracking-[0.12em] uppercase text-text-light mb-1.5">
                Dari tanggal
              </span>
              <input
                type="date"
                value={payrollStartDate}
                onChange={(e) => {
                  setPayrollStartDate(e.target.value);
                  setPayrollPage(0);
                  setSelectedPayrollId(null);
                }}
                className="w-full px-3 py-2.5 font-sans text-[13px] text-text-dark bg-cream border border-sand rounded-sm outline-none focus:border-forest-mid"
              />
            </label>

            <label className="block">
              <span className="block text-[10px] font-medium tracking-[0.12em] uppercase text-text-light mb-1.5">
                Sampai tanggal
              </span>
              <input
                type="date"
                value={payrollEndDate}
                onChange={(e) => {
                  setPayrollEndDate(e.target.value);
                  setPayrollPage(0);
                  setSelectedPayrollId(null);
                }}
                className="w-full px-3 py-2.5 font-sans text-[13px] text-text-dark bg-cream border border-sand rounded-sm outline-none focus:border-forest-mid"
              />
            </label>

            <Button
              type="button"
              variant="ghost"
              className="px-4 py-2.5 text-[12px]"
              onClick={() => {
                setPayrollStartDate("");
                setPayrollEndDate("");
                setPayrollPage(0);
                setSelectedPayrollId(null);
              }}
            >
              Reset Filter
            </Button>
          </div>

          <div className="border border-cream-dark rounded-md overflow-x-auto">
            <div className="min-w-[860px]">
              <div className="grid grid-cols-[1.1fr_1fr_1fr_0.8fr_0.75fr] gap-4 px-5 py-3 bg-cream border-b border-cream-dark">
                <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-light">Payroll</span>
                <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-light">Referensi</span>
                <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-light">Tanggal</span>
                <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-light text-right">Nominal</span>
                <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-light text-center">Status</span>
              </div>

              {payrolls.isLoading && (
                <div className="px-5 py-10 text-center text-[13px] text-text-light">Memuat payroll...</div>
              )}

              {payrolls.isError && (
                <div className="px-5 py-10 text-center">
                  <p className="text-[13px] text-error mb-4">
                    {payrolls.error instanceof Error ? payrolls.error.message : "Gagal memuat payroll."}
                  </p>
                  <Button variant="ghost" className="px-4 py-2 text-[12px]" onClick={() => payrolls.refetch()}>
                    Coba lagi
                  </Button>
                </div>
              )}

              {!payrolls.isLoading && !payrolls.isError && payrollItems.length === 0 && (
                <div className="px-5 py-12 text-center">
                  <p className="text-[13px] text-text-light">Belum ada payroll pada filter tanggal ini.</p>
                </div>
              )}

              {!payrolls.isLoading && !payrolls.isError && payrollItems.map((payroll) => (
                <div
                  key={payroll.payrollId}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedPayrollId(payroll.payrollId)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedPayrollId(payroll.payrollId);
                    }
                  }}
                  className={`grid grid-cols-[1.1fr_1fr_1fr_0.8fr_0.75fr] gap-4 items-center px-5 py-3 border-b border-cream-dark last:border-b-0 cursor-pointer transition-colors ${
                    selectedPayrollId === payroll.payrollId ? "bg-forest/5" : "hover:bg-cream"
                  }`}
                >
                  <div>
                    <p className="font-mono text-[11px] text-text-mid" title={payroll.payrollId}>
                      {compactPayrollId(payroll.payrollId)}
                    </p>
                    <p className="text-[11px] text-text-light mt-0.5">{payroll.role}</p>
                  </div>

                  <div>
                    <p className="text-[12px] text-text-dark">{payroll.referenceType}</p>
                    <p className="font-mono text-[11px] text-text-light" title={payroll.referenceId}>
                      {compactPayrollId(payroll.referenceId)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[12px] text-text-mid">Dibuat: {formatPayrollDate(payroll.createdAt)}</p>
                    <p className="text-[11px] text-text-light">Diproses: {formatPayrollDate(payroll.processedAt)}</p>
                  </div>

                  <p className="font-serif text-[22px] leading-none text-forest text-right">
                    {formatPayrollMoney(payroll.netAmount)}
                  </p>

                  <div className="text-center">
                    <span className={`inline-block px-2.5 py-1 rounded border text-[11px] font-medium ${payrollStatusClass(payroll.status)}`}>
                      {payroll.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!payrolls.isLoading && !payrolls.isError && payrolls.data && (
            <PayrollPagination
              page={payrolls.data.page}
              totalPages={payrolls.data.totalPages}
              totalElements={payrolls.data.totalElements}
              onPageChange={(nextPage) => {
                setPayrollPage(nextPage);
                setSelectedPayrollId(null);
              }}
            />
          )}

          <PayrollDetailDialog
            payroll={selectedPayroll}
            relationLinks={selectedRelationLinks}
            onClose={() => setSelectedPayrollId(null)}
          />
        </div>
      )}

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
