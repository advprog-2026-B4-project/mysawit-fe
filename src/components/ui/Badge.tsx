import type { UserRole } from "@/modules/auth";

const roleClasses: Record<UserRole, string> = {
  ADMIN:  "bg-forest/[.13] text-forest",
  MANDOR: "bg-bark/[.13] text-bark",
  BURUH:  "bg-gold/[.13] text-[#7a6020]",
  SUPIR:  "bg-[#2e5c8a]/[.13] text-[#1a3d5c]",
};

const roleLabel: Record<UserRole, string> = {
  ADMIN:  "Admin",
  MANDOR: "Mandor",
  BURUH:  "Buruh",
  SUPIR:  "Supir",
};

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className={`inline-block px-2.5 py-[3px] rounded-[2px] text-[11px] font-medium tracking-[0.08em] uppercase ${roleClasses[role]}`}>
      {roleLabel[role]}
    </span>
  );
}