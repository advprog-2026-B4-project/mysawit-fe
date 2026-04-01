"use client";

import { useState, useEffect } from "react";
import { useAuth, ROLE_ROUTES } from "@/modules/auth";
import { getToken, getRole } from "@/lib/api/tokenStorage";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

function mapLoginError(err: unknown): string {
  if (!(err instanceof Error)) return "Login gagal. Silakan coba lagi.";
  const msg = err.message;
  if (msg.includes("terdaftar via Google")) return msg;
  if (msg.includes("tidak terdaftar")) return "Email tidak ditemukan. Periksa kembali atau daftar akun baru.";
  if (msg.includes("Password salah")) return "Password yang Anda masukkan salah. Silakan coba lagi.";
  if (msg.includes("Network Error") || msg.includes("ERR_NETWORK"))
    return "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
  return "Login gagal. Silakan coba lagi.";
}

export default function LoginPage() {
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    if (getToken()) {
      router.replace(ROLE_ROUTES[getRole() ?? ""] ?? "/admin/users");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginWithEmail({ email, password });
    } catch (err: unknown) {
      setError(mapLoginError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setGLoading(true);
    try { await loginWithGoogle(); }
    catch (err: unknown) { setError(mapLoginError(err)); }
    finally { setGLoading(false); }
  }

  return (
    <div className="min-h-screen bg-cream grid grid-cols-1 md:grid-cols-2">
      {/* Left - decorative panel (hidden on mobile) */}
      <div className="hidden md:flex bg-forest flex-col justify-between p-[60px] relative overflow-hidden">
        <div className="absolute -bottom-[120px] -left-[120px] w-[500px] h-[500px] rounded-full border border-white/[.06]" />
        <div className="absolute -bottom-[60px] -left-[60px] w-[340px] h-[340px] rounded-full border border-white/[.04]" />
        <div className="absolute top-[40%] -right-[80px] w-[260px] h-[260px] rounded-full border border-gold/[.12]" />

        {/* Logo */}
        <div>
          <div className="font-serif text-[28px] font-medium text-cream tracking-[0.02em]">
            MySawit
          </div>
          <div className="w-8 h-px bg-gold mt-3" />
        </div>

        {/* Tagline */}
        <div>
          <p className="font-serif text-[42px] font-light text-cream leading-[1.2] tracking-[-0.01em] mb-5">
            Kelola kebun<br />
            <em className="text-gold italic">lebih cerdas.</em>
          </p>
          <p className="font-sans text-[13px] font-light text-cream/55 leading-[1.7] max-w-[320px]">
            Platform digital terintegrasi untuk manajemen perkebunan sawit BurhanSawit - dari buruh hingga pabrik.
          </p>
        </div>

        {/* Footer note */}
        <div className="text-[11px] text-cream/30 tracking-[0.08em]">
          (c) 2025 BurhanSawit
        </div>
      </div>

      {/* Right - form panel */}
      <div className="flex items-center justify-center p-6 md:p-[60px]">
        <div className="w-full max-w-[360px]">
          {/* Mobile logo */}
          <div className="md:hidden flex flex-col items-center mb-8">
            <div className="font-serif text-[28px] font-medium text-forest tracking-[0.02em]">MySawit</div>
            <div className="w-8 h-px bg-gold mt-2" />
          </div>
          <div className="mb-12">
            <h1 className="font-serif text-[36px] font-normal text-text-dark mb-2">
              Selamat datang
            </h1>
            <p className="text-[13px] font-light text-text-light">
              Masuk ke akun MySawit Anda
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <Input
              label="Email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-6"
            />
            <Input
              label="Password"
              type="password"
              placeholder="--------"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-6"
            />

            {error && (
              <div className="px-4 py-3 bg-error/[.07] border border-error/[.27] rounded text-[13px] text-error">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full justify-center">
              Masuk
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-sand" />
            <span className="text-[11px] text-text-light tracking-[0.08em]">ATAU</span>
            <div className="flex-1 h-px bg-sand" />
          </div>

          {/* Google OAuth */}
          <button
            onClick={handleGoogle}
            disabled={gLoading}
            className="w-full py-[11px] px-6 bg-white border border-sand rounded font-sans text-[13px] font-normal text-text-mid flex items-center justify-center gap-2.5 transition-colors duration-200 hover:border-forest-light disabled:cursor-not-allowed"
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {gLoading ? "Mengalihkan..." : "Lanjutkan dengan Google"}
          </button>

          <p className="mt-8 text-center text-[13px] font-light text-text-light">
            Belum punya akun?{" "}
            <Link href="/register" className="text-forest-mid no-underline font-normal border-b border-forest-light">
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
