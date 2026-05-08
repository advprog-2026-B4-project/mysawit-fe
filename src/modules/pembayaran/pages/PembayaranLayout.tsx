"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const subNavItems = [
  { href: "/admin/pembayaran/variabel-pokok", label: "Variabel Pokok" },
  { href: "/admin/pembayaran/payroll",        label: "Payroll" },
  { href: "/admin/pembayaran/topup",          label: "Topup" },
];

export default function PembayaranLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-normal text-text-dark mb-1.5">
          Pembayaran
        </h1>
        <p className="font-sans text-[13px] font-light text-text-light">
          Kelola variabel upah, payroll, dan pembayaran dalam sistem MySawit
        </p>
      </div>

      {/* Sub-navigation tabs */}
      <div className="flex gap-0 border-b border-cream-dark mb-8 -mt-1">
        {subNavItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "px-5 py-2.5 font-sans text-[13px] tracking-[0.02em] no-underline",
                "border-b-2 -mb-px transition-colors duration-150",
                active
                  ? "font-normal text-forest border-forest"
                  : "font-light text-text-light border-transparent hover:text-text-mid",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Sub-page content */}
      {children}
    </div>
  );
}
