"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const role  = searchParams.get("role");

    if (token && role) {
      // Simpan token di window (in-memory)
      window.__mysawit_access_token = token;
      // Redirect ke dashboard sesuai role
      router.push(`/${role.toLowerCase()}`);
    } else {
      // Kalau tidak ada token, fallback ke login
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