"use client";

import { useState, useEffect } from "react";
import { useAuth, ROLE_ROUTES } from "@/modules/auth";
import type { UserRole } from "@/modules/auth";
import { getToken, getRole } from "@/lib/api/tokenStorage";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { useRouter } from "next/navigation";

function mapRegisterError(err: unknown): string {
  if (!(err instanceof Error)) return "Registrasi gagal. Silakan coba lagi.";
  const msg = err.message;
  if (msg.includes("already registered") || msg.includes("sudah terdaftar"))
    return "Email ini sudah terdaftar. Silakan masuk atau gunakan email lain.";
  if (msg.includes("Network Error") || msg.includes("ERR_NETWORK"))
    return "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
  return "Registrasi gagal. Silakan coba lagi.";
}

const ROLES: { value: UserRole; label: string; desc: string }[] = [
  { value: "BURUH",  label: "Buruh Sawit",  desc: "Personel lapangan pemanen" },
  { value: "MANDOR", label: "Mandor",        desc: "Pengawas operasional kebun" },
  { value: "SUPIR",  label: "Supir Truk",    desc: "Armada transportasi hasil panen" },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "" as UserRole | "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (getToken()) {
      router.replace(ROLE_ROUTES[getRole() ?? ""] ?? "/admin/users");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set(field: string, val: string) {
    setForm((f) => ({ ...f, [field]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.role) { setError("Pilih peran terlebih dahulu"); return; }
    setError(""); setLoading(true);
    try {
      await register({ ...form, role: form.role as UserRole });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: unknown) {
      setError(mapRegisterError(err));
    } finally {
      setLoading(false);
    }
  }

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-forest text-cream flex items-center justify-center text-2xl mx-auto mb-5">
          &#10003;
        </div>
        <h2 className="font-serif text-2xl font-normal text-text-dark mb-2">
          Akun berhasil dibuat
        </h2>
        <p className="text-[13px] text-text-light">
          Mengalihkan ke halaman login...
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream grid grid-cols-1 md:grid-cols-2">
      {/* Left panel (hidden on mobile) */}
      <div className="hidden md:flex bg-forest flex-col justify-between p-[60px] relative overflow-hidden">
        <div className="absolute -top-[100px] -right-[100px] w-[400px] h-[400px] rounded-full border border-gold/[.08]" />
        <div className="absolute bottom-[10%] -left-[80px] w-[280px] h-[280px] rounded-full border border-white/[.05]" />

        <div>
          <div className="font-serif text-[28px] font-medium text-cream tracking-[0.02em]">MySawit</div>
          <div className="w-8 h-px bg-gold mt-3" />
        </div>

        <div>
          <p className="font-serif text-[38px] font-light text-cream leading-[1.25] mb-5">
            Bergabunglah<br />
            <em className="text-gold">bersama kami.</em>
          </p>
          <p className="text-[13px] font-light text-cream/50 leading-[1.7] max-w-[300px]">
            Daftar sebagai bagian dari tim BurhanSawit dan mulai kelola tugas harian Anda.
          </p>
        </div>

        <div className="text-[11px] text-cream/30 tracking-[0.08em]">
          (c) 2025 BurhanSawit
        </div>
      </div>

      {/* Right - form */}
      <div className="flex items-center justify-center p-6 md:p-[60px] overflow-y-auto">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="md:hidden flex flex-col items-center mb-8">
            <div className="font-serif text-[28px] font-medium text-forest tracking-[0.02em]">MySawit</div>
            <div className="w-8 h-px bg-gold mt-2" />
          </div>
          <div className="mb-10">
            <h1 className="font-serif text-[34px] font-normal text-text-dark mb-2">
              Buat akun baru
            </h1>
            <p className="text-[13px] font-light text-text-light">
              Isi informasi di bawah untuk memulai
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input label="Nama Lengkap" placeholder="Budi Santoso" value={form.name}
              onChange={(e) => set("name", e.target.value)} required className="w-full px-6" />
            <Input label="Email" type="email" placeholder="nama@email.com" value={form.email}
              onChange={(e) => set("email", e.target.value)} required className="w-full px-6" />
            <Input label="Password" type="password" placeholder="Min. 8 karakter" value={form.password}
              onChange={(e) => set("password", e.target.value)} required minLength={8} className="w-full px-6" />

            {/* Role selector */}
            <div>
              <label className="block mb-2.5 text-[11px] font-medium tracking-[0.12em] uppercase text-text-mid">
                Peran
              </label>
              <div className="flex flex-col gap-2">
                {ROLES.map((r) => (
                  <label key={r.value} className={`flex items-center gap-3 px-4 py-3 border rounded cursor-pointer transition-all duration-200 ${
                    form.role === r.value ? "bg-forest border-forest" : "bg-white border-sand"
                  }`}>
                    <input type="radio" name="role" value={r.value}
                      checked={form.role === r.value}
                      onChange={() => set("role", r.value)}
                      className="hidden" />
                    <div className="flex-1">
                      <div className={`text-[13px] font-normal ${
                        form.role === r.value ? "text-cream" : "text-text-dark"
                      }`}>
                        {r.label}
                      </div>
                      <div className={`text-[11px] mt-0.5 ${
                        form.role === r.value ? "text-cream/60" : "text-text-light"
                      }`}>
                        {r.desc}
                      </div>
                    </div>
                    {form.role === r.value && (
                      <div className="w-[18px] h-[18px] rounded-full bg-gold flex items-center justify-center text-[10px] text-forest font-semibold">
                        &#10003;
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 bg-error/[.07] border border-error/[.27] rounded text-[13px] text-error">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full justify-center">
              Buat Akun
            </Button>
          </form>

          <p className="mt-7 text-center text-[13px] font-light text-text-light">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-forest-mid no-underline font-normal border-b border-forest-light">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
