"use client";

import RoleGuard from "@/components/guards/RoleGuard";

interface MandorGuardProps {
  children: React.ReactNode;
}

export default function MandorGuard({ children }: MandorGuardProps) {
  return (
    <RoleGuard
      allowedRoles={["MANDOR"]}
      unauthenticatedRedirectTo="/login"
      unauthorizedRedirectTo="/"
      unauthorizedMode="redirect"
    >
      {children}
    </RoleGuard>
  );
}