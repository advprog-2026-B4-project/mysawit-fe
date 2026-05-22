"use client";

import RoleGuard from "@/components/guards/RoleGuard";

interface SupirGuardProps {
  children: React.ReactNode;
}

export default function SupirGuard({ children }: SupirGuardProps) {
  return (
    <RoleGuard
      allowedRoles={["SUPIR"]}
      unauthenticatedRedirectTo="/login"
      unauthorizedRedirectTo="/"
      unauthorizedMode="redirect"
    >
      {children}
    </RoleGuard>
  );
}