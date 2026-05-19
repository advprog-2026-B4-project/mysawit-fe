import { Button } from "@/components/ui/Button";
import { formatCents, formatDate, formatNumber, formatWeight } from "@/lib/formatters";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { PayrollDTO, PayrollStatus } from "../api/pembayaranApi";

export type PayrollStatusFilter = PayrollStatus | "";

export const PAYROLL_STATUS_FILTERS: Array<{ label: string; value: PayrollStatusFilter }> = [
  { label: "Semua status", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

export function formatPayrollMoney(value: number) {
  return `${formatCents(value)} $`;
}

export function formatPayrollDate(value: string | null) {
  return formatDate(value);
}

export function payrollStatusClass(status: PayrollStatus): string {
  if (status === "APPROVED") return "text-success border-success bg-success/5";
  if (status === "REJECTED") return "text-error border-error bg-error/5";
  return "text-forest border-forest/35 bg-forest/5";
}

export function compactPayrollId(value: string) {
  if (value.length <= 12) return value;
  return `${value.slice(0, 8)}...${value.slice(-4)}`;
}

export function resolvePayrollReferenceLink(payroll: PayrollDTO): { href: string; label: string } {
  if (payroll.referenceType === "PANEN") {
    return {
      href: `/panen/create?referenceId=${encodeURIComponent(payroll.referenceId)}`,
      label: "Buka modul panen",
    };
  }

  if (payroll.role === "MANDOR") {
    return {
      href: `/mandor/supir?referenceId=${encodeURIComponent(payroll.referenceId)}`,
      label: "Buka modul pengiriman mandor",
    };
  }

  return {
    href: `/supir/pengiriman?referenceId=${encodeURIComponent(payroll.referenceId)}`,
    label: "Buka modul pengiriman supir",
  };
}

export function resolveEvidencePhotoUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  if (!apiBase) {
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  }

  const normalizedBase = apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase;
  const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${normalizedBase}${normalizedPath}`;
}

interface PayrollRelationLink {
  label: string;
  href: string;
  value: string;
}

interface PayrollDetailDialogProps {
  payroll: PayrollDTO | null;
  relationLinks: PayrollRelationLink[];
  onClose: () => void;
}

export function PayrollDetailDialog({ payroll, relationLinks, onClose }: PayrollDetailDialogProps) {
  const [selectedEvidenceUrl, setSelectedEvidenceUrl] = useState<string | null>(null);
  const [selectedEvidenceIndex, setSelectedEvidenceIndex] = useState<number>(0);

  const evidencePhotoUrls = useMemo(() => {
    const urls = (payroll?.evidencePhotoUrls ?? [])
      .map(resolveEvidencePhotoUrl)
      .filter((url) => url.length > 0);
    return Array.from(new Set(urls));
  }, [payroll?.evidencePhotoUrls]);

  if (!payroll) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[120] bg-forest/45 backdrop-blur-[2px] px-4 py-6 sm:px-6 sm:py-10 overflow-y-auto"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Detail payroll"
        onClick={(event) => event.stopPropagation()}
        className="max-w-3xl mx-auto bg-white border border-cream-dark rounded-md p-4 sm:p-6 shadow-[0_24px_64px_rgba(26,46,26,0.18)]"
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="font-serif text-[24px] text-text-dark">Detail Payroll</h3>
            <p className="font-sans text-[12px] text-text-light">Klik relasi untuk membuka data terkait.</p>
          </div>
          <Button
            variant="ghost"
            className="px-3 py-1.5 text-[11px]"
            onClick={onClose}
          >
            Tutup
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="border border-cream-dark rounded p-3">
            <p className="text-[10px] tracking-[0.12em] uppercase text-text-light mb-1">Payroll ID</p>
            <p className="font-mono text-[12px] text-text-mid break-all">{payroll.payrollId}</p>
          </div>

          {relationLinks.map((link) => (
            <div key={`${link.label}-${link.value}`} className="border border-cream-dark rounded p-3">
              <p className="text-[10px] tracking-[0.12em] uppercase text-text-light mb-1">{link.label}</p>
              <Link href={link.href} className="font-mono text-[12px] text-forest underline break-all">
                {link.value}
              </Link>
            </div>
          ))}
        </div>

        <div className="border border-cream-dark rounded p-4 bg-cream/40">
          <p className="text-[10px] tracking-[0.12em] uppercase text-text-light mb-2">Detail Perhitungan</p>
          <p className="font-sans text-[13px] text-text-mid mb-1">
            Berat: <span className="font-medium text-text-dark">{formatWeight(payroll.weight)}</span>
          </p>
          <p className="font-sans text-[13px] text-text-mid mb-1">
            Tarif upah: <span className="font-medium text-text-dark">{formatCents(payroll.wageRateApplied)} $/kg</span>
          </p>
          <p className="font-sans text-[13px] text-text-mid mb-1">
            Rumus: <span className="font-medium text-text-dark">{formatWeight(payroll.weight)} × {formatCents(payroll.wageRateApplied)} $/kg</span>
          </p>
          <p className="font-sans text-[13px] text-text-mid mb-1">
            Total: <span className="font-medium text-text-dark">{formatPayrollMoney(payroll.netAmount)}</span>
          </p>
          <p className="font-sans text-[12px] text-text-light mt-2">
            Dibuat: {formatPayrollDate(payroll.createdAt)} | Diproses: {formatPayrollDate(payroll.processedAt)}
          </p>

          {payroll.status === "REJECTED" && payroll.rejectionReason && (
            <p className="mt-3 font-sans text-[12px] text-error">
              Alasan penolakan: {payroll.rejectionReason}
            </p>
          )}
        </div>

        {payroll.referenceType === "PANEN" && (
          <div className="mt-4 border border-cream-dark rounded p-4 bg-cream/40">
            <p className="text-[10px] tracking-[0.12em] uppercase text-text-light mb-2">Bukti Panen</p>

            {evidencePhotoUrls.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {evidencePhotoUrls.map((url, index) => (
                  <button
                    key={`${url}-${index}`}
                    type="button"
                    onClick={() => {
                      setSelectedEvidenceUrl(url);
                      setSelectedEvidenceIndex(index + 1);
                    }}
                    className="h-16 w-16 overflow-hidden rounded border border-cream-dark bg-white"
                    title={`Buka bukti foto ${index + 1}`}
                  >
                    <Image
                      src={url}
                      alt={`Bukti panen ${index + 1}`}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <p className="font-sans text-[12px] text-text-light">Belum ada foto bukti panen.</p>
            )}
          </div>
        )}
      </div>

      {selectedEvidenceUrl && (
        <div
          className="fixed inset-0 z-[130] bg-forest/70 backdrop-blur-[1px] p-4 sm:p-8"
          onClick={() => setSelectedEvidenceUrl(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Preview bukti panen"
            className="max-w-5xl mx-auto h-full flex flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="bg-white rounded-md border border-cream-dark p-3 sm:p-4 shadow-[0_20px_48px_rgba(20,36,20,0.35)] flex-1 min-h-0 flex flex-col">
              <div className="flex items-center justify-between gap-3 mb-3">
                <p className="font-sans text-[12px] text-text-mid">Bukti panen #{selectedEvidenceIndex}</p>
                <div className="flex items-center gap-2">
                  <a
                    href={selectedEvidenceUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded border border-forest px-3 py-1.5 font-sans text-[11px] text-forest hover:bg-forest/5"
                  >
                    Download
                  </a>
                  <Button
                    type="button"
                    variant="ghost"
                    className="px-3 py-1.5 text-[11px]"
                    onClick={() => setSelectedEvidenceUrl(null)}
                  >
                    Tutup
                  </Button>
                </div>
              </div>

              <div className="flex-1 min-h-0 rounded border border-cream-dark bg-cream/40 overflow-auto relative">
                <Image
                  src={selectedEvidenceUrl}
                  alt={`Preview bukti panen ${selectedEvidenceIndex}`}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface PayrollFilterCardProps {
  startDate: string;
  endDate: string;
  status: PayrollStatusFilter;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onStatusChange: (value: PayrollStatusFilter) => void;
  onReset: () => void;
}

export function PayrollFilterCard({
  startDate,
  endDate,
  status,
  onStartDateChange,
  onEndDateChange,
  onStatusChange,
  onReset,
}: PayrollFilterCardProps) {
  return (
    <div className="border border-cream-dark rounded-md bg-white p-5 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[0.9fr_0.9fr_1fr_auto] gap-3 items-end">
        <label className="block">
          <span className="block font-sans text-[10px] font-medium tracking-[0.12em] uppercase text-text-light mb-1.5">
            Dari tanggal
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full px-3 py-2.5 font-sans text-[13px] text-text-dark bg-cream border border-sand rounded-sm outline-none focus:border-forest-mid"
          />
        </label>

        <label className="block">
          <span className="block font-sans text-[10px] font-medium tracking-[0.12em] uppercase text-text-light mb-1.5">
            Sampai tanggal
          </span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full px-3 py-2.5 font-sans text-[13px] text-text-dark bg-cream border border-sand rounded-sm outline-none focus:border-forest-mid"
          />
        </label>

        <label className="block">
          <span className="block font-sans text-[10px] font-medium tracking-[0.12em] uppercase text-text-light mb-1.5">
            Status
          </span>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as PayrollStatusFilter)}
            className="w-full px-3 py-2.5 font-sans text-[13px] text-text-dark bg-cream border border-sand rounded-sm outline-none focus:border-forest-mid"
          >
            {PAYROLL_STATUS_FILTERS.map((item) => (
              <option key={item.label} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>

        <Button
          type="button"
          variant="ghost"
          className="w-full sm:w-auto px-5 py-2.5 text-[12px]"
          onClick={onReset}
        >
          Reset Filter
        </Button>
      </div>
    </div>
  );
}

interface PayrollPaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (nextPage: number) => void;
}

export function PayrollPagination({
  page,
  totalPages,
  totalElements,
  onPageChange,
}: PayrollPaginationProps) {
  if (totalPages <= 1) {
    return (
      <p className="mt-3 font-sans text-xs text-text-light text-right">
        {formatNumber(totalElements)} payroll ditemukan
      </p>
    );
  }

  return (
    <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
      <p className="font-sans text-xs text-text-light">
        {formatNumber(totalElements)} payroll ditemukan
      </p>

      <div className="flex items-center justify-end gap-2 flex-wrap">
        <Button
          type="button"
          variant="ghost"
          className="px-3 py-1.5 text-[11px]"
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
        >
          Sebelumnya
        </Button>

        <span className="font-sans text-[12px] text-text-mid px-2">
          Halaman {page + 1} / {totalPages}
        </span>

        <Button
          type="button"
          variant="ghost"
          className="px-3 py-1.5 text-[11px]"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
        >
          Berikutnya
        </Button>
      </div>
    </div>
  );
}