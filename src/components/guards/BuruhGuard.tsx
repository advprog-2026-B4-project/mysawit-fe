"use client";

import RoleGuard from "@/components/guards/RoleGuard";

interface BuruhGuardProps {
  children: React.ReactNode;
}

export default function BuruhGuard({ children }: BuruhGuardProps) {
  return (
    <RoleGuard
      allowedRoles={["BURUH"]}
      unauthenticatedRedirectTo="/login"
      unauthorizedRedirectTo="/"
      unauthorizedMode="redirect"
    >
      {children}
    </RoleGuard>
  );
}