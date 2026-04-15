"use client";

import { useMemo, useState } from "react";
import AdminGuard from "@/components/guards/AdminGuard";
import { Button } from "@/components/ui/Button";
import { DEFAULT_PAYROLL_PAGE_SIZE, type PayrollDTO, type PayrollListFilter } from "../api/pembayaranApi";
import { useAllPayrolls, useApprovePayroll, useRejectPayroll } from "../hooks/usePayroll";
import {
	compactPayrollId,
	formatPayrollDate,
	formatPayrollMoney,
	payrollStatusClass,
	PayrollDetailDialog,
	PayrollFilterCard,
	PayrollPagination,
	resolveEvidencePhotoUrl,
	resolvePayrollReferenceLink,
	type PayrollStatusFilter,
} from "../components/PayrollShared";

function PayrollRow({
	payroll,
	onApprove,
	onOpenReject,
	onOpenDetail,
	isSelected,
	isMutating,
}: {
	payroll: PayrollDTO;
	onApprove: (payrollId: string) => Promise<void>;
	onOpenReject: (payrollId: string) => void;
	onOpenDetail: (payroll: PayrollDTO) => void;
	isSelected: boolean;
	isMutating: boolean;
}) {
	const shouldLoadPanenEvidence = payroll.status === "PENDING" && payroll.referenceType === "PANEN";
	const evidencePhotoUrls = useMemo(() => {
		const urls = (payroll.evidencePhotoUrls ?? [])
			.map(resolveEvidencePhotoUrl)
			.filter((url) => url.length > 0);
		return Array.from(new Set(urls));
	}, [payroll.evidencePhotoUrls]);

	return (
		<div
			role="button"
			tabIndex={0}
			onClick={() => onOpenDetail(payroll)}
			onKeyDown={(event) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					onOpenDetail(payroll);
				}
			}}
			className={`grid grid-cols-[1.2fr_0.65fr_1.2fr_0.8fr_0.7fr_0.95fr] gap-4 items-center px-6 py-4 border-b border-cream-dark last:border-b-0 cursor-pointer transition-colors ${
				isSelected ? "bg-forest/5" : "hover:bg-cream"
			}`}
		>
			<div>
				<p className="font-mono text-[11px] text-text-mid" title={payroll.payrollId}>
					{compactPayrollId(payroll.payrollId)}
				</p>
				<p className="font-sans text-[12px] text-text-light mt-0.5">
					Dibuat: {formatPayrollDate(payroll.createdAt)}
				</p>
			</div>

			<div>
				<p className="font-sans text-[11px] uppercase tracking-[0.08em] text-text-light">{payroll.role}</p>
				<p className="font-mono text-[11px] text-text-mid" title={payroll.userId}>
					{compactPayrollId(payroll.userId)}
				</p>
			</div>

			<div>
				<p className="font-sans text-[12px] text-text-dark">{payroll.referenceType}</p>
				<p className="font-mono text-[11px] text-text-light" title={payroll.referenceId}>
					{compactPayrollId(payroll.referenceId)}
				</p>
			</div>

			<div className="text-right">
				<p className="font-serif text-[24px] leading-none text-forest">{formatPayrollMoney(payroll.netAmount)}</p>
				<p className="font-sans text-[11px] text-text-light mt-0.5">{payroll.weight.toLocaleString("id-ID")} kg</p>
			</div>

			<div className="text-center">
				<span className={`inline-block px-2.5 py-1 rounded border text-[11px] font-medium ${payrollStatusClass(payroll.status)}`}>
					{payroll.status}
				</span>
			</div>

			<div className="flex flex-wrap justify-end gap-2 content-start">
				{payroll.status === "PENDING" ? (
					<>
						<Button
							variant="secondary"
							className="px-3 py-2 text-[11px]"
							disabled={isMutating}
							onClick={(event) => {
								event.stopPropagation();
								void onApprove(payroll.payrollId);
							}}
						>
							Setujui
						</Button>
						<Button
							variant="danger"
							className="px-3 py-2 text-[11px]"
							disabled={isMutating}
							onClick={(event) => {
								event.stopPropagation();
								onOpenReject(payroll.payrollId);
							}}
						>
							Tolak
						</Button>
					</>
				) : (
					<p className="font-sans text-[12px] text-text-light">Diproses</p>
				)}

				{shouldLoadPanenEvidence && (
					<div className="w-full pt-1">
						<p className="font-sans text-[10px] uppercase tracking-[0.08em] text-text-light text-right">
							Bukti Panen
						</p>

						{evidencePhotoUrls.length > 0 ? (
							<div className="mt-1.5 flex flex-wrap justify-end gap-1.5">
								{evidencePhotoUrls.map((photoUrl, index) => {
									return (
										<div
											key={`${photoUrl}-${index}`}
											className="block h-12 w-12 overflow-hidden rounded border border-cream-dark bg-cream"
											title={`Lihat bukti foto ${index + 1}`}
										>
											{/* eslint-disable-next-line @next/next/no-img-element */}
											<img
												src={photoUrl}
												alt={`Bukti panen ${index + 1}`}
												className="h-full w-full object-cover"
												loading="lazy"
											/>
										</div>
									);
								})}
							</div>
						) : (
							<p className="font-sans text-[11px] text-text-light text-right mt-1">Belum ada foto bukti.</p>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

function AdminPayrollPageContent() {
	const [status, setStatus] = useState<PayrollStatusFilter>("");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [page, setPage] = useState(0);

	const [rejectTarget, setRejectTarget] = useState<string | null>(null);
	const [rejectReason, setRejectReason] = useState("");
	const [localError, setLocalError] = useState<string | null>(null);
	const [selectedPayrollId, setSelectedPayrollId] = useState<string | null>(null);

	const filter = useMemo<PayrollListFilter>(
		() => ({
			status: status || undefined,
			startDate: startDate || undefined,
			endDate: endDate || undefined,
			page,
			size: DEFAULT_PAYROLL_PAGE_SIZE,
		}),
		[endDate, page, startDate, status],
	);

	const { data, isLoading, isError, error, refetch } = useAllPayrolls(filter);
	const approvePayroll = useApprovePayroll();
	const rejectPayroll = useRejectPayroll();
	const payrollItems = useMemo(() => data?.items ?? [], [data?.items]);
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

	const isMutating = approvePayroll.isPending || rejectPayroll.isPending;

	async function handleApprove(payrollId: string) {
		setLocalError(null);
		try {
			await approvePayroll.mutateAsync(payrollId);
		} catch (err) {
			setLocalError(err instanceof Error ? err.message : "Gagal menyetujui payroll.");
		}
	}

	async function handleReject() {
		if (!rejectTarget) return;
		if (!rejectReason.trim()) {
			setLocalError("Alasan penolakan wajib diisi.");
			return;
		}

		setLocalError(null);
		try {
			await rejectPayroll.mutateAsync({
				payrollId: rejectTarget,
				reason: rejectReason.trim(),
			});
			setRejectTarget(null);
			setRejectReason("");
		} catch (err) {
			setLocalError(err instanceof Error ? err.message : "Gagal menolak payroll.");
		}
	}

	return (
		<div className="w-full">
			<div className="mb-8">
				<h2 className="font-serif text-[32px] text-text-dark mb-1.5">Payroll</h2>
				<p className="font-sans text-[13px] font-light text-text-light">
					Lihat seluruh payroll dan proses approval atau rejection untuk pencairan upah pekerja.
				</p>
			</div>

			<PayrollFilterCard
				status={status}
				startDate={startDate}
				endDate={endDate}
				onStatusChange={(value) => {
					setStatus(value);
					setPage(0);
					setSelectedPayrollId(null);
				}}
				onStartDateChange={(value) => {
					setStartDate(value);
					setPage(0);
					setSelectedPayrollId(null);
				}}
				onEndDateChange={(value) => {
					setEndDate(value);
					setPage(0);
					setSelectedPayrollId(null);
				}}
				onReset={() => {
					setStatus("");
					setStartDate("");
					setEndDate("");
					setPage(0);
					setSelectedPayrollId(null);
				}}
			/>

			{rejectTarget && (
				<div className="border border-error/35 bg-error/5 rounded-md p-4 mb-6">
					<p className="font-sans text-[12px] text-text-mid mb-2">
						Menolak payroll <span className="font-mono">{rejectTarget}</span>
					</p>
					<textarea
						rows={3}
						value={rejectReason}
						onChange={(e) => setRejectReason(e.target.value)}
						placeholder="Tuliskan alasan penolakan payroll..."
						className="w-full px-3 py-2.5 font-sans text-[13px] text-text-dark bg-white border border-sand rounded-sm outline-none focus:border-forest-mid"
					/>
					<div className="mt-3 flex flex-wrap gap-2 justify-end">
						<Button
							variant="ghost"
							className="px-4 py-2 text-[12px]"
							disabled={isMutating}
							onClick={() => {
								setRejectTarget(null);
								setRejectReason("");
							}}
						>
							Batal
						</Button>
						<Button
							variant="danger"
							className="px-4 py-2 text-[12px]"
							loading={rejectPayroll.isPending}
							onClick={handleReject}
						>
							Konfirmasi Tolak
						</Button>
					</div>
				</div>
			)}

			{localError && (
				<p className="mb-4 font-sans text-[13px] text-error">{localError}</p>
			)}

			<div className="border border-cream-dark rounded-md bg-white overflow-hidden">
				<div className="overflow-x-auto">
					<div className="min-w-[980px]">
						<div className="grid grid-cols-[1.2fr_0.65fr_1.2fr_0.8fr_0.7fr_0.95fr] gap-4 px-6 py-3 bg-cream border-b border-cream-dark">
							<span className="font-sans text-[10px] font-medium tracking-[0.12em] uppercase text-text-light">Payroll</span>
							<span className="font-sans text-[10px] font-medium tracking-[0.12em] uppercase text-text-light">Pekerja</span>
							<span className="font-sans text-[10px] font-medium tracking-[0.12em] uppercase text-text-light">Referensi</span>
							<span className="font-sans text-[10px] font-medium tracking-[0.12em] uppercase text-text-light text-right">Nominal</span>
							<span className="font-sans text-[10px] font-medium tracking-[0.12em] uppercase text-text-light text-center">Status</span>
							<span className="font-sans text-[10px] font-medium tracking-[0.12em] uppercase text-text-light text-right">Aksi</span>
						</div>

						{isLoading && (
							<div className="px-6 py-12 text-center font-sans text-[13px] text-text-light">
								Memuat payroll...
							</div>
						)}

						{isError && (
							<div className="px-6 py-12 text-center">
								<p className="font-sans text-[13px] text-error mb-4">
									{error instanceof Error ? error.message : "Gagal memuat payroll."}
								</p>
								<Button variant="ghost" className="px-4 py-2 text-[12px]" onClick={() => refetch()}>
									Coba lagi
								</Button>
							</div>
						)}

						{!isLoading && !isError && payrollItems.length === 0 && (
							<div className="px-6 py-14 text-center">
								<h3 className="font-serif text-[24px] text-text-dark">Belum ada payroll</h3>
								<p className="mt-2 font-sans text-[13px] text-text-light">
									Belum ada data payroll yang cocok dengan filter saat ini.
								</p>
							</div>
						)}

						{!isLoading && !isError && payrollItems.map((payroll) => (
							<PayrollRow
								key={payroll.payrollId}
								payroll={payroll}
								onApprove={handleApprove}
								onOpenReject={setRejectTarget}
								onOpenDetail={(item) => setSelectedPayrollId(item.payrollId)}
								isSelected={selectedPayrollId === payroll.payrollId}
								isMutating={isMutating}
							/>
						))}
					</div>
				</div>
			</div>

			<PayrollDetailDialog
				payroll={selectedPayroll}
				relationLinks={selectedRelationLinks}
				onClose={() => setSelectedPayrollId(null)}
			/>

			{!isLoading && !isError && data && (
				<PayrollPagination
					page={data.page}
					totalPages={data.totalPages}
					totalElements={data.totalElements}
					onPageChange={(nextPage) => {
						setPage(nextPage);
						setSelectedPayrollId(null);
					}}
				/>
			)}
		</div>
	);
}

export default function AdminPayrollPage() {
	return (
		<AdminGuard>
			<AdminPayrollPageContent />
		</AdminGuard>
	);
}
