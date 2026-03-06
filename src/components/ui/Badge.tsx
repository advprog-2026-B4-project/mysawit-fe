import type { UserRole } from "@/modules/auth";

const roleColors: Record<UserRole, { bg: string; color: string }> = {
  ADMIN:  { bg: "#1a2e1a22", color: "var(--forest)" },
  MANDOR: { bg: "#6b4c2a22", color: "var(--bark)" },
  BURUH:  { bg: "#c9a84c22", color: "#7a6020" },
  SUPIR:  { bg: "#2e5c8a22", color: "#1a3d5c" },
};

const roleLabel: Record<UserRole, string> = {
  ADMIN:  "Admin",
  MANDOR: "Mandor",
  BURUH:  "Buruh",
  SUPIR:  "Supir",
};

export function RoleBadge({ role }: { role: UserRole }) {
  const c = roleColors[role];
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: "2px",
      background: c.bg,
      color: c.color,
      fontSize: "11px",
      fontWeight: 500,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
    }}>
      {roleLabel[role]}
    </span>
  );
}