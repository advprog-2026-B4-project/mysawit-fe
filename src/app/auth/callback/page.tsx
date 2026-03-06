"use client";

import { Suspense } from "react";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const ROLE_ROUTES: Record<string, string> = {
  ADMIN:  "/admin/users",
  MANDOR: "/mandor",
  BURUH:  "/buruh",
  SUPIR:  "/supir",
};

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const role  = searchParams.get("role");

    if (token && role) {
      window.__mysawit_access_token = token;
      router.push(ROLE_ROUTES[role] ?? "/login");
    } else {
      router.push("/login");
    }
  }, [searchParams, router]);

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      flexDirection: "column", alignItems: "center",
      justifyContent: "center", background: "var(--cream)", gap: "20px",
    }}>
      <div style={{
        width: "36px", height: "36px", borderRadius: "50%",
        border: "2px solid var(--sand)",
        borderTopColor: "var(--forest)",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "13px", color: "var(--text-light)",
      }}>
        Mengautentikasi akun Anda…
      </p>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={null}>
      <CallbackHandler />
    </Suspense>
  );
}