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
    <div style={{
      minHeight: "100vh",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      background: "var(--cream)",
    }}>
      {/* Left - decorative panel */}
      <div style={{
        background: "var(--forest)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "60px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle texture rings */}
        <div style={{
          position: "absolute", bottom: "-120px", left: "-120px",
          width: "500px", height: "500px", borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.06)",
        }} />
        <div style={{
          position: "absolute", bottom: "-60px", left: "-60px",
          width: "340px", height: "340px", borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.04)",
        }} />
        <div style={{
          position: "absolute", top: "40%", right: "-80px",
          width: "260px", height: "260px", borderRadius: "50%",
          border: "1px solid rgba(201,168,76,0.12)",
        }} />

        {/* Logo */}
        <div>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "28px",
            fontWeight: 500,
            color: "var(--cream)",
            letterSpacing: "0.02em",
          }}>
            MySawit
          </div>
          <div style={{
            width: "32px", height: "1px",
            background: "var(--gold)",
            marginTop: "12px",
          }} />
        </div>

        {/* Tagline */}
        <div>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "42px",
            fontWeight: 300,
            color: "var(--cream)",
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
            marginBottom: "20px",
          }}>
            Kelola kebun<br />
            <em style={{ color: "var(--gold)", fontStyle: "italic" }}>lebih cerdas.</em>
          </p>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "13px",
            fontWeight: 300,
            color: "rgba(245,240,232,0.55)",
            lineHeight: 1.7,
            maxWidth: "320px",
          }}>
            Platform digital terintegrasi untuk manajemen perkebunan sawit BurhanSawit - dari buruh hingga pabrik.
          </p>
        </div>

        {/* Footer note */}
        <div style={{
          fontSize: "11px",
          color: "rgba(245,240,232,0.3)",
          letterSpacing: "0.08em",
        }}>
          (c) 2025 BurhanSawit
        </div>
      </div>

      {/* Right - form panel */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px",
      }}>
        <div style={{ width: "100%", maxWidth: "360px" }}>
          <div style={{ marginBottom: "48px" }}>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "36px",
              fontWeight: 400,
              color: "var(--text-dark)",
              marginBottom: "8px",
            }}>
              Selamat datang
            </h1>
            <p style={{
              fontSize: "13px",
              fontWeight: 300,
              color: "var(--text-light)",
            }}>
              Masuk ke akun MySawit Anda
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <Input
              label="Email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="--------"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div style={{
                padding: "12px 16px",
                background: "#8b2e2e11",
                border: "1px solid #8b2e2e44",
                borderRadius: "4px",
                fontSize: "13px",
                color: "var(--error)",
              }}>
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} style={{ width: "100%", justifyContent: "center" }}>
              Masuk
            </Button>
          </form>

          {/* Divider */}
          <div style={{
            display: "flex", alignItems: "center",
            gap: "16px", margin: "28px 0",
          }}>
            <div style={{ flex: 1, height: "1px", background: "var(--sand)" }} />
            <span style={{ fontSize: "11px", color: "var(--text-light)", letterSpacing: "0.08em" }}>
              ATAU
            </span>
            <div style={{ flex: 1, height: "1px", background: "var(--sand)" }} />
          </div>

          {/* Google OAuth */}
          <button
            onClick={handleGoogle}
            disabled={gLoading}
            style={{
              width: "100%",
              padding: "11px 24px",
              background: "var(--white)",
              border: "1px solid var(--sand)",
              borderRadius: "4px",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "13px",
              fontWeight: 400,
              color: "var(--text-mid)",
              cursor: gLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              transition: "border-color 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = "var(--forest-light)")}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = "var(--sand)")}
          >
            {/* Google SVG */}
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {gLoading ? "Mengalihkan..." : "Lanjutkan dengan Google"}
          </button>

          <p style={{
            marginTop: "32px",
            textAlign: "center",
            fontSize: "13px",
            fontWeight: 300,
            color: "var(--text-light)",
          }}>
            Belum punya akun?{" "}
            <Link href="/register" style={{
              color: "var(--forest-mid)",
              textDecoration: "none",
              fontWeight: 400,
              borderBottom: "1px solid var(--forest-light)",
            }}>
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}