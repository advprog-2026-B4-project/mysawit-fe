"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getRole, getToken, getUserIdFromToken } from "@/lib/api/tokenStorage";
import { DEFAULT_PAYROLL_PAGE_SIZE, type PayrollListFilter } from "../api/pembayaranApi";
import { formatNumber, formatWeight } from "@/lib/formatters";
import { usePayrollsByUser } from "../hooks/usePayroll";
import { useWalletBalance } from "../hooks/useWallet";
import {
	compactPayrollId,
	formatPayrollDate,
	formatPayrollMoney,
	payrollStatusClass,
	PayrollDetailDialog,
	PayrollFilterCard,
	PayrollPagination,
	resolvePayrollReferenceLink,
	type PayrollStatusFilter,
} from "../components/PayrollShared";

const WORKER_ROLES = new Set(["BURUH", "SUPIR", "MANDOR"]);

function WorkerPayrollPageContent({ userId, role }: { userId: string; role: string }) {
	const [status, setStatus] = useState<PayrollStatusFilter>("");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [page, setPage] = useState(0);
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

	const wallet = useWalletBalance(userId);
	const payrolls = usePayrollsByUser(userId, filter);
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
		return [{
			label: "Referensi terkait",
			href: referenceLink.href,
			value: selectedPayroll.referenceId,
		}];
	}, [selectedPayroll]);

	return (
		<div className="min-h-screen bg-cream px-4 sm:px-6 py-10">
			<div className="max-w-6xl mx-auto">
				<div className="mb-8">
					<h1 className="font-serif text-[36px] text-text-dark">Wallet & Payroll Saya</h1>
					<p className="mt-2 font-sans text-[13px] font-light text-text-light">
						Ringkasan saldo wallet dan riwayat payroll untuk role {role}.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
					<div className="border border-cream-dark bg-white rounded-md px-6 py-5">
						<p className="font-sans text-[10px] font-medium tracking-[0.12em] uppercase text-text-light mb-2">
							Saldo Wallet
						</p>

						{wallet.isLoading ? (
							<p className="font-sans text-[13px] text-text-light">Memuat saldo...</p>
						) : wallet.isError ? (
							<p className="font-sans text-[13px] text-error">
								{wallet.error instanceof Error ? wallet.error.message : "Gagal memuat saldo."}
							</p>
						) : (
							<>
								<p className="font-serif text-[38px] leading-none text-forest">
									{formatPayrollMoney(wallet.data?.balance ?? 0)}
								</p>
								<p className="mt-2 font-sans text-[12px] text-text-light">
									Update terakhir: {formatPayrollDate(wallet.data?.lastUpdated ?? null)}
								</p>
							</>
						)}
					</div>

					<div className="border border-cream-dark bg-white rounded-md px-6 py-5">
						<p className="font-sans text-[10px] font-medium tracking-[0.12em] uppercase text-text-light mb-2">
							Ringkasan Payroll
						</p>
						<p className="font-serif text-[38px] leading-none text-forest">
							{formatNumber(payrolls.data?.totalElements ?? 0)}
						</p>
						<p className="mt-2 font-sans text-[12px] text-text-light">
							Total riwayat payroll berdasarkan filter aktif.
						</p>
					</div>
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

				<p className="mb-3 font-sans text-[12px] text-text-light">
					Klik salah satu baris payroll untuk melihat detail perhitungan.
				</p>

				<div className="border border-cream-dark rounded-md bg-white overflow-hidden">
					<div className="overflow-x-auto">
						<div className="min-w-[860px]">
							<div className="grid grid-cols-[1.1fr_1fr_0.8fr_0.9fr_0.8fr] gap-4 px-6 py-3 bg-cream border-b border-cream-dark">
								<span className="font-sans text-[10px] font-medium tracking-[0.12em] uppercase text-text-light">Referensi</span>
								<span className="font-sans text-[10px] font-medium tracking-[0.12em] uppercase text-text-light">Waktu</span>
								<span className="font-sans text-[10px] font-medium tracking-[0.12em] uppercase text-text-light text-right">Berat</span>
								<span className="font-sans text-[10px] font-medium tracking-[0.12em] uppercase text-text-light text-right">Nominal</span>
								<span className="font-sans text-[10px] font-medium tracking-[0.12em] uppercase text-text-light text-center">Status</span>
							</div>

							{payrolls.isLoading && (
								<div className="px-6 py-12 text-center font-sans text-[13px] text-text-light">
									Memuat riwayat payroll...
								</div>
							)}

							{payrolls.isError && (
								<div className="px-6 py-12 text-center">
									<p className="font-sans text-[13px] text-error mb-4">
										{payrolls.error instanceof Error ? payrolls.error.message : "Gagal memuat riwayat payroll."}
									</p>
									<Button variant="ghost" className="px-4 py-2 text-[12px]" onClick={() => payrolls.refetch()}>
										Coba lagi
									</Button>
								</div>
							)}

							{!payrolls.isLoading && !payrolls.isError && payrollItems.length === 0 && (
								<div className="px-6 py-14 text-center">
									<h2 className="font-serif text-[24px] text-text-dark">Belum ada payroll</h2>
									<p className="mt-2 font-sans text-[13px] text-text-light">
										Riwayat payroll Anda akan tampil di sini setelah proses perhitungan upah.
									</p>
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
									className={`grid grid-cols-[1.1fr_1fr_0.8fr_0.9fr_0.8fr] gap-4 items-center px-6 py-4 border-b border-cream-dark last:border-b-0 cursor-pointer transition-colors ${
										selectedPayrollId === payroll.payrollId ? "bg-forest/5" : "hover:bg-cream"
									}`}
								>
							<div>
								<p className="font-sans text-[12px] text-text-dark">{payroll.referenceType}</p>
								<p className="font-mono text-[11px] text-text-light" title={payroll.referenceId}>
									{compactPayrollId(payroll.referenceId)}
								</p>
							</div>

							<div>
								<p className="font-sans text-[12px] text-text-mid">Dibuat: {formatPayrollDate(payroll.createdAt)}</p>
								<p className="font-sans text-[11px] text-text-light">Diproses: {formatPayrollDate(payroll.processedAt)}</p>
							</div>

							<div className="text-right font-sans text-[13px] text-text-dark">
								{formatWeight(payroll.weight)}
							</div>

							<div className="text-right font-serif text-[24px] leading-none text-forest">
								{formatPayrollMoney(payroll.netAmount)}
							</div>

							<div className="text-center">
								<span className={`inline-block px-2.5 py-1 rounded border text-[11px] font-medium ${payrollStatusClass(payroll.status)}`}>
									{payroll.status}
								</span>
								{payroll.status === "REJECTED" && payroll.rejectionReason && (
									<p className="mt-1 font-sans text-[11px] text-error">{payroll.rejectionReason}</p>
								)}
							</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{!payrolls.isLoading && !payrolls.isError && payrolls.data && (
					<PayrollPagination
						page={payrolls.data.page}
						totalPages={payrolls.data.totalPages}
						totalElements={payrolls.data.totalElements}
						onPageChange={(nextPage) => {
							setPage(nextPage);
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
		</div>
	);
}

export default function WorkerPayrollPage() {
	const hasSession = Boolean(getToken());
	const role = getRole();
	const userId = getUserIdFromToken();

	if (!hasSession) {
		return (
			<div className="min-h-screen bg-cream px-6 py-12">
				<div className="max-w-3xl mx-auto border border-cream-dark bg-white rounded-md px-8 py-10 text-center">
					<h1 className="font-serif text-[30px] text-text-dark">Wallet & Payroll Saya</h1>
					<p className="mt-2 font-sans text-sm text-text-light">
						Anda perlu login terlebih dahulu untuk melihat wallet dan riwayat payroll.
					</p>
					<div className="mt-6">
						<Link href="/login">
							<Button variant="primary">Masuk</Button>
						</Link>
					</div>
				</div>
			</div>
		);
	}

	if (!role || !WORKER_ROLES.has(role)) {
		return (
			<div className="min-h-screen bg-cream px-6 py-12">
				<div className="max-w-3xl mx-auto border border-cream-dark bg-white rounded-md px-8 py-10 text-center">
					<h1 className="font-serif text-[30px] text-text-dark">Akses Terbatas</h1>
					<p className="mt-2 font-sans text-sm text-text-light">
						Halaman ini hanya dapat diakses oleh BURUH, SUPIR, atau MANDOR.
					</p>
				</div>
			</div>
		);
	}

	if (!userId) {
		return (
			<div className="min-h-screen bg-cream px-6 py-12">
				<div className="max-w-3xl mx-auto border border-cream-dark bg-white rounded-md px-8 py-10 text-center">
					<h1 className="font-serif text-[30px] text-text-dark">Sesi Tidak Valid</h1>
					<p className="mt-2 font-sans text-sm text-text-light">
						Tidak dapat membaca identitas pengguna dari token. Silakan login ulang.
					</p>
					<div className="mt-6">
						<Link href="/login">
							<Button variant="primary">Login Ulang</Button>
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return <WorkerPayrollPageContent userId={userId} role={role} />;
}
