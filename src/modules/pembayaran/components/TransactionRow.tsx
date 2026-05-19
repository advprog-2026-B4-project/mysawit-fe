"use client";

import { useState } from "react";
import type { WalletTransactionDTO } from "../api/pembayaranApi";
import { formatRupiah, formatDollar } from "@/lib/formatters";
import { formatPayrollDate, compactPayrollId } from "./PayrollShared";

interface TransactionRowProps {
  transaction: WalletTransactionDTO;
  onClick?: (transactionId: string) => void;
}

export default function TransactionRow({ transaction, onClick }: TransactionRowProps) {
  const [expanded, setExpanded] = useState(false);
  const isCredit = transaction.type === "CREDIT";

  const internalCents = transaction.amount;
  const rupiahAmount = internalCents * 100;

  const handleClick = () => {
    if (onClick) {
      onClick(transaction.transactionId);
    } else {
      setExpanded(!expanded);
    }
  };

  return (
    <div className="border-b border-cream-dark last:border-b-0">
      <div
        className="grid grid-cols-[1fr_auto] gap-4 px-6 py-4 items-center cursor-pointer hover:bg-cream/50 transition-colors"
        onClick={handleClick}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
              isCredit
                ? "bg-green/10 text-green"
                : "bg-red-500/10 text-red-600"
            }`}>
              {transaction.type}
            </span>
          </div>
          <p className="font-sans text-[13px] text-text-dark mt-1">
            {transaction.reference || "Topup Wallet"}
          </p>
          <p className="font-mono text-[11px] text-text-mid mt-0.5">
            {compactPayrollId(transaction.transactionId)}
          </p>
          <p className="font-sans text-[11px] text-text-light mt-0.5">
            {formatPayrollDate(transaction.createdAt)}
          </p>
        </div>
        <div className="text-right">
          <p className={`font-sans text-[16px] font-semibold ${
            isCredit ? "text-green" : "text-text-dark"
          }`}>
            {isCredit ? "+" : "-"} {formatRupiah(rupiahAmount)}
          </p>
          <p className={`font-sans text-[12px] ${
            isCredit ? "text-green/70" : "text-text-mid"
          }`}>
            {isCredit ? "+" : "-"} {formatDollar(internalCents / 100)}
          </p>
          <div className="mt-1">
            {expanded ? (
              <span className="text-text-light">▲</span>
            ) : (
              <span className="text-text-light">▼</span>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-6 pb-4 bg-cream/30">
          <div className="grid grid-cols-2 gap-2 text-[12px]">
            <div>
              <p className="text-text-light font-sans">Transaction ID</p>
              <p className="text-text-dark font-mono text-[11px]">{transaction.transactionId}</p>
            </div>
            <div>
              <p className="text-text-light font-sans">Reference</p>
              <p className="text-text-dark font-mono text-[11px]">{transaction.reference || "-"}</p>
            </div>
            <div>
              <p className="text-text-light font-sans">Internal Amount</p>
              <p className="text-text-dark font-sans">{formatDollar(internalCents / 100)}</p>
            </div>
            <div>
              <p className="text-text-light font-sans">Rupiah Equivalent</p>
              <p className="text-text-dark font-sans">{formatRupiah(rupiahAmount)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}