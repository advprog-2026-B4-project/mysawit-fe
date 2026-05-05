"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { clearAuth, getToken } from "@/lib/api/tokenStorage";
import AdminGuard from "@/components/guards/AdminGuard";
import { Button } from "@/components/ui/Button";

const navItems = [
  { href: "/admin/users",      label: "Pengguna" },
  { href: "/admin/kebun",      label: "Kebun" },
  { href: "/admin/panen",      label: "Panen" },
  { href: "/admin/pengiriman", label: "Pengiriman" },
  { href: "/admin/pembayaran", label: "Pembayaran" },
  { href: "/admin/pembayaran/topup", label: "Topup Saldo" },
];

function subscribe() { return () => {}; }
function getSnapshot() { return true; }
function getServerSnapshot() { return false; }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <AdminGuard>
      <div className="h-screen bg-cream-dark flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full lg:w-55 bg-forest shrink-0 lg:h-screen lg:sticky lg:top-0 lg:flex lg:flex-col lg:py-8">
          <div className="px-4 py-4 border-b border-white/10 lg:px-7 lg:pb-8 lg:border-b-0">
            <div className="flex items-center justify-between lg:block">
              <div>
                <div className="font-serif text-[22px] font-medium text-cream tracking-[0.02em]">
                  MySawit
                </div>
                <div className="w-6 h-px bg-gold mt-2" />
                <div className="mt-2 text-[10px] font-normal tracking-[0.14em] uppercase text-cream/35">
                  Admin Utama
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="lg:hidden px-3 py-2 border-0 text-cream/80 hover:text-cream hover:bg-white/10 active:bg-white/15 text-[11px] tracking-widest uppercase"
                aria-label="Toggle admin navigation"
                aria-expanded={mobileMenuOpen}
                aria-controls="admin-nav"
              >
                Menu
              </Button>
            </div>
          </div>

          <div className={`${mobileMenuOpen ? "block" : "hidden"} lg:flex lg:flex-1 lg:flex-col lg:min-h-0`}>
            <nav id="admin-nav" className="flex flex-col gap-0.5 px-3 py-3 lg:flex-1 lg:py-0 lg:overflow-y-auto">
              {navItems.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2.5 rounded text-[13px] tracking-[0.02em] no-underline transition-all duration-150 ${
                      active
                        ? "font-normal text-cream bg-white/8"
                        : "font-light text-cream/50 hover:text-cream/85"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="px-3 pb-4 lg:pb-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  clearAuth();
                  setMobileMenuOpen(false);
                  router.push("/login");
                }}
                className="w-full px-4 py-2.5 border-0 text-cream/70 hover:text-cream hover:bg-white/10 active:bg-white/15 justify-start text-left tracking-[0.02em]"
              >
                Keluar
              </Button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-0 p-4 sm:p-6 lg:p-12 overflow-y-auto">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}