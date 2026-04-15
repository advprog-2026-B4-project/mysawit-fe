import MandorGuard from "@/components/guards/MandorGuard";
import RoleShellLayout from "@/components/layout/RoleShellLayout";

const mandorNavItems = [
  { href: "/mandor/dashboard", label: "Dashboard" },
  { href: "/mandor/profile", label: "Profil Saya" },
  { href: "/mandor/supir", label: "Supir Kebun" },
  { href: "/mandor/pembayaran", label: "Payroll & Wallet" },
];

export default function MandorLayout({ children }: { children: React.ReactNode }) {
  return (
    <MandorGuard>
      <RoleShellLayout roleLabel="Mandor" navItems={mandorNavItems}>
        {children}
      </RoleShellLayout>
    </MandorGuard>
  );
}
