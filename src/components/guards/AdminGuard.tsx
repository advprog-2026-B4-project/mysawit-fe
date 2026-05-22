"use client";

import RoleGuard from "@/components/guards/RoleGuard";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  return (
    <RoleGuard allowedRoles={["ADMIN"]} unauthorizedMode="logout">
      {children}
    </RoleGuard>
  );
}
