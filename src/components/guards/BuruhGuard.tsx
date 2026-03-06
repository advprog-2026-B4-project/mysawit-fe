"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/modules/auth";
import { getRole } from "@/lib/api/tokenStorage";

interface BuruhGuardProps {
  children: React.ReactNode;
}

export default function BuruhGuard({ children }: BuruhGuardProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    if (getRole() !== "BURUH") {
      router.push("/");
      return;
    }

    setAuthorized(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (authorized === null) {
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