"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const navItems = [
  { href: "/admin/users",  label: "Pengguna" },
  { href: "/admin/kebun",  label: "Kebun" },
  { href: "/admin/panen",  label: "Panen" },
  { href: "/admin/pengiriman", label: "Pengiriman" },
  { href: "/admin/pembayaran", label: "Pembayaran" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && !window.__mysawit_access_token) {
      router.push("/login");
    }
  }, [router]);

  if (!mounted) return null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream-dark)", display: "flex" }}>
      {/* Sidebar */}
      <aside style={{
        width: "220px", minHeight: "100vh",
        background: "var(--forest)",
        display: "flex", flexDirection: "column",
        padding: "32px 0", flexShrink: 0,
        position: "sticky", top: 0,
      }}>
        <div style={{ padding: "0 28px 32px" }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "22px", fontWeight: 500,
            color: "var(--cream)", letterSpacing: "0.02em",
          }}>MySawit</div>
          <div style={{ width: "24px", height: "1px", background: "var(--gold)", marginTop: "8px" }} />
          <div style={{
            marginTop: "8px", fontSize: "10px", fontWeight: 400,
            letterSpacing: "0.14em", textTransform: "uppercase",
            color: "rgba(245,240,232,0.35)",
          }}>
            Admin Utama
          </div>
        </div>

        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px", padding: "0 12px" }}>
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} style={{
                display: "block",
                padding: "10px 16px",
                borderRadius: "4px",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "13px", fontWeight: active ? 400 : 300,
                color: active ? "var(--cream)" : "rgba(245,240,232,0.5)",
                background: active ? "rgba(255,255,255,0.08)" : "transparent",
                textDecoration: "none",
                transition: "all 0.15s",
                letterSpacing: "0.02em",
              }}
                onMouseOver={(e) => { if (!active) e.currentTarget.style.color = "rgba(245,240,232,0.85)"; }}
                onMouseOut={(e) => { if (!active) e.currentTarget.style.color = "rgba(245,240,232,0.5)"; }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: "0 12px" }}>
          <button
            onClick={() => {
              if (typeof window !== "undefined") delete window.__mysawit_access_token;
              router.push("/login");
            }}
            style={{
              width: "100%", padding: "10px 16px",
              background: "transparent", border: "none",
              borderRadius: "4px", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "13px", fontWeight: 300,
              color: "rgba(245,240,232,0.35)",
              textAlign: "left", letterSpacing: "0.02em",
              transition: "color 0.15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "rgba(245,240,232,0.7)")}
            onMouseOut={(e) => (e.currentTarget.style.color = "rgba(245,240,232,0.35)")}
          >
            Keluar
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: "48px", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}