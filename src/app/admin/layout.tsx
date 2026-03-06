"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { clearAuth, getToken } from "@/lib/api/tokenStorage";

const navItems = [
  { href: "/admin/users",      label: "Pengguna" },
  { href: "/admin/kebun",      label: "Kebun" },
  { href: "/admin/panen",      label: "Panen" },
  { href: "/admin/pengiriman", label: "Pengiriman" },
  { href: "/admin/pembayaran", label: "Pembayaran" },
];

function subscribe() { return () => {}; }
function getSnapshot() { return true; }
function getServerSnapshot() { return false; }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();

  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (!mounted) return;
    if (!getToken()) {
      router.push("/login");
    } else if (pathname === "/admin") {
      router.push("/admin/users");
    }
  }, [mounted, router, pathname]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-cream-dark flex">
      {/* Sidebar */}
      <aside className="w-[220px] min-h-screen bg-forest flex flex-col py-8 shrink-0 sticky top-0">
        <div className="px-7 pb-8">
          <div className="font-serif text-[22px] font-medium text-cream tracking-[0.02em]">
            MySawit
          </div>
          <div className="w-6 h-px bg-gold mt-2" />
          <div className="mt-2 text-[10px] font-normal tracking-[0.14em] uppercase text-cream/35">
            Admin Utama
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-0.5 px-3">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-2.5 rounded text-[13px] tracking-[0.02em] no-underline transition-all duration-150 ${
                  active
                    ? "font-normal text-cream bg-white/[.08]"
                    : "font-light text-cream/50 hover:text-cream/85"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3">
          <button
            onClick={() => {
              clearAuth();
              router.push("/login");
            }}
            className="w-full px-4 py-2.5 bg-transparent border-none rounded cursor-pointer font-sans text-[13px] font-light text-cream/35 hover:text-cream/70 text-left tracking-[0.02em] transition-colors duration-150"
          >
            Keluar
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-12 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}