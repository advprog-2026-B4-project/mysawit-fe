"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/modules/auth";
import type { UserRole } from "@/modules/auth";

const OAUTH_ROLES: { value: Exclude<UserRole, "ADMIN">; label: string; desc: string }[] = [
  { value: "BURUH", label: "Buruh Sawit", desc: "Personel lapangan pemanen" },
  { value: "SUPIR", label: "Supir Truk", desc: "Armada transportasi hasil panen" },
  { value: "MANDOR", label: "Mandor", desc: "Pengawas operasional kebun" },
];

function mapOauthRoleSelectionError(err: unknown): string {
  if (!(err instanceof Error)) return "Gagal menyelesaikan registrasi OAuth.";
  const msg = err.message;
  if (msg.includes("Invalid or expired registration token")) {
    return "Sesi OAuth Anda sudah kedaluwarsa. Silakan login dengan Google lagi.";
  }
  if (msg.includes("Nomor sertifikasi mandor wajib diisi")) {
    return "Nomor sertifikasi mandor wajib diisi.";
  }
  if (msg.includes("Network Error") || msg.includes("ERR_NETWORK")) {
    return "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
  }
  return msg || "Gagal menyelesaikan registrasi OAuth.";
}

function OAuthRoleSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { completeOAuthRegistration } = useAuth();

  const registrationToken = searchParams.get("registrationToken") ?? "";
  const email = searchParams.get("email") ?? "";
  const name = searchParams.get("name") ?? "";

  const [selectedRole, setSelectedRole] = useState<Exclude<UserRole, "ADMIN"> | "">("");
  const [mandorCertificationNumber, setMandorCertificationNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const displayName = useMemo(() => name || "Pengguna Google", [name]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!registrationToken) {
      router.replace("/login");
      return;
    }

    if (!selectedRole) {
      setError("Pilih role terlebih dahulu.");
      return;
    }

    if (selectedRole === "MANDOR" && !mandorCertificationNumber.trim()) {
      setError("Nomor sertifikasi mandor wajib diisi.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await completeOAuthRegistration({
        registrationToken,
        role: selectedRole,
        mandorCertificationNumber:
          selectedRole === "MANDOR" ? mandorCertificationNumber.trim() : undefined,
      });
    } catch (err: unknown) {
      setError(mapOauthRoleSelectionError(err));
    } finally {
      setLoading(false);
    }
  }

  if (!registrationToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream p-6">
        <div className="w-full max-w-[480px] rounded-xl border border-sand bg-white p-8 text-center">
          <h1 className="font-serif text-[28px] text-text-dark">Sesi OAuth tidak ditemukan</h1>
          <p className="mt-3 text-[13px] text-text-light">
            Silakan ulangi login dengan Google untuk memilih role akun Anda.
          </p>
          <Button className="mt-6" onClick={() => router.push("/login")}>Kembali ke Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="w-full max-w-[640px] rounded-2xl border border-sand bg-white p-8 md:p-10">
        <h1 className="font-serif text-[34px] leading-tight text-text-dark">Lengkapi akun Google Anda</h1>
        <p className="mt-2 text-[13px] text-text-light">
          Halo {displayName}, pilih role akun untuk melanjutkan ke sistem.
        </p>
        {email && (
          <p className="mt-1 text-[12px] text-text-light">Email: {email}</p>
        )}

        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
          <div>
            <span className="block mb-2.5 text-[11px] font-medium tracking-[0.12em] uppercase text-text-mid">
              Role
            </span>
            <div className="flex flex-col gap-2">
              {OAUTH_ROLES.map((r) => (
                <label
                  key={r.value}
                  className={`flex items-center gap-3 px-4 py-3 border rounded cursor-pointer transition-all duration-200 ${
                    selectedRole === r.value ? "bg-forest border-forest" : "bg-white border-sand"
                  }`}
                >
                  <input
                    type="radio"
                    name="oauth-role"
                    value={r.value}
                    checked={selectedRole === r.value}
                    onChange={() => setSelectedRole(r.value)}
                    aria-label="Pilih peran"
                    className="hidden"
                  />
                  <div className="flex-1">
                    <div className={`text-[13px] font-normal ${selectedRole === r.value ? "text-cream" : "text-text-dark"}`}>
                      {r.label}
                    </div>
                    <div className={`text-[11px] mt-0.5 ${selectedRole === r.value ? "text-cream/60" : "text-text-light"}`}>
                      {r.desc}
                    </div>
                  </div>
                  {selectedRole === r.value && (
                    <div className="w-[18px] h-[18px] rounded-full bg-gold flex items-center justify-center text-[10px] text-forest font-semibold">
                      &#10003;
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {selectedRole === "MANDOR" && (
            <Input
              label="Nomor Sertifikasi Mandor"
              placeholder="Contoh: MND-2026-001"
              value={mandorCertificationNumber}
              onChange={(e) => setMandorCertificationNumber(e.target.value)}
              required
              className="w-full px-6"
            />
          )}

          {error && (
            <div className="px-4 py-3 bg-error/[.07] border border-error/[.27] rounded text-[13px] text-error">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full justify-center">
            Simpan dan Lanjutkan
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function OAuthRoleSelectionPage() {
  return (
    <Suspense fallback={null}>
      <OAuthRoleSelectionContent />
    </Suspense>
  );
}
