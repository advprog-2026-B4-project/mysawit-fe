"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/modules/auth";
import { getRole } from "@/lib/api/tokenStorage";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { isAuthenticated, logout } = useAuth();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isAuthenticated() || getRole() !== "ADMIN") {
      logout();
      return;
    }
    setAuthorized(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (authorized === null) {
    // Splash while verifying - matches the earthy theme
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <span className="font-sans text-sm text-text-light tracking-widest uppercase animate-pulse">
          Memverifikasi...
        </span>
      </div>
    );
  }

  return <>{children}</>;
}
