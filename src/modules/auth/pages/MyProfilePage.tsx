"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCurrentUser } from "@/modules/auth";
import { RoleBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const ROLE_HOME_ROUTES: Record<string, string> = {
  ADMIN: "/admin/users",
  MANDOR: "/mandor/dashboard",
  BURUH: "/buruh/dashboard",
  SUPIR: "/supir/dashboard",
};

export default function MyProfilePage() {
  const { data: user, isLoading, isError, error, refetch } = useCurrentUser();

  const backHref = useMemo(() => {
    if (!user?.role) {
      return "/";
    }
    return ROLE_HOME_ROUTES[user.role] ?? "/";
  }, [user?.role]);

  if (isLoading) {
    return <div className="p-12 text-[13px] text-text-light">Memuat profil...</div>;
  }

  if (isError || !user) {
    return (
      <div className="p-12">
        <p className="text-[13px] text-error mb-4">
          {error instanceof Error ? error.message : "Gagal memuat profil."}
        </p>
        <Button variant="ghost" onClick={() => refetch()} className="px-4 py-2 text-[12px]">
          Coba lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-[680px]">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-[12px] tracking-[0.06em] text-text-light no-underline mb-8 uppercase"
      >
        {"<-"} Kembali
      </Link>

      <div className="flex items-start justify-between mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="font-serif text-[34px] font-normal text-text-dark">Profil Saya</h1>
            <RoleBadge userRole={user.role} />
          </div>
          <p className="text-[13px] font-light text-text-light">Informasi akun Anda di sistem MySawit.</p>
        </div>
      </div>

      <div className="bg-white border border-cream-dark rounded-md p-8">
        <h3 className="font-serif text-[18px] font-normal text-text-dark mb-6 pb-4 border-b border-cream-dark">
          Informasi Akun
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { label: "Nama Lengkap", value: user.name },
            { label: "Username", value: `@${user.username}` },
            { label: "Email", value: user.email },
            { label: "Peran", value: user.role },
            ...(user.role === "MANDOR"
              ? [{ label: "Nomor Sertifikasi Mandor", value: user.mandorCertificationNumber?.trim() || "Belum diisi" }]
              : []),
            { label: "User ID", value: user.userId },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-light mb-1.5">
                {label}
              </div>
              <div className="text-[14px] font-light text-text-dark break-words">
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
