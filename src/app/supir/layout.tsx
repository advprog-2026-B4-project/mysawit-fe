import SupirGuard from "@/components/guards/SupirGuard";
import RoleShellLayout from "@/components/layout/RoleShellLayout";

const supirNavItems = [
  { href: "/supir/dashboard", label: "Dashboard" },
  { href: "/supir/profile", label: "Profil Saya" },
  { href: "/supir/pengiriman", label: "Pengiriman" },
  { href: "/supir/pembayaran", label: "Payroll & Wallet" },
];

export default function SupirLayout({ children }: { children: React.ReactNode }) {
  return (
    <SupirGuard>
      <RoleShellLayout roleLabel="Supir" navItems={supirNavItems}>
        {children}
      </RoleShellLayout>
    </SupirGuard>
  );
}
