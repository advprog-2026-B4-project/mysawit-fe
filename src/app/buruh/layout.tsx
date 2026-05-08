"use client";

import BuruhGuard from "@/components/guards/BuruhGuard";
import RoleShellLayout from "@/components/layout/RoleShellLayout";

const buruhNavItems = [
  { href: "/buruh/dashboard", label: "Dashboard" },
  { href: "/buruh/profile", label: "Profil Saya" },
  { href: "/buruh/panen/create", label: "Catat Panen" },
  { href: "/buruh/pembayaran", label: "Payroll & Wallet" },
  { href: "/buruh/panen/history", label: "Riwayat Panen" },
];

export default function BuruhLayout({ children }: { children: React.ReactNode }) {
  return (
    <BuruhGuard>
      <RoleShellLayout roleLabel="Buruh" navItems={buruhNavItems}>
        {children}
      </RoleShellLayout>
    </BuruhGuard>
  );
}
