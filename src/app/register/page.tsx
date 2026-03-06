"use client";

import { useState } from "react";
import { useAuth } from "@/modules/auth";
import type { UserRole } from "@/modules/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
      setError(err instanceof Error ? err.message : "Registrasi gagal");
    } finally {
      setLoading(false);
    }
  }

  if (success) return (
    <div style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "var(--cream)",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: "56px", height: "56px", borderRadius: "50%",
          background: "var(--forest)", color: "var(--cream)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "24px", margin: "0 auto 20px",
        }}>✓</div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", marginBottom: "8px" }}>
          Akun berhasil dibuat
        </h2>
        <p style={{ fontSize: "13px", color: "var(--text-light)" }}>
          Mengalihkan ke halaman login…
        </p>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      background: "var(--cream)",
    }}>
      {/* Left panel */}
      <div style={{
        background: "var(--forest)",
        display: "flex", flexDirection: "column",
        justifyContent: "space-between",
        padding: "60px", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-100px", right: "-100px",
          width: "400px", height: "400px", borderRadius: "50%",
          border: "1px solid rgba(201,168,76,0.08)",
        }} />
        <div style={{
          position: "absolute", bottom: "10%", left: "-80px",
          width: "280px", height: "280px", borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.05)",
        }} />

        <div>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "28px", fontWeight: 500,
            color: "var(--cream)", letterSpacing: "0.02em",
          }}>MySawit</div>
          <div style={{ width: "32px", height: "1px", background: "var(--gold)", marginTop: "12px" }} />
        </div>

        <div>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "38px", fontWeight: 300,
            color: "var(--cream)", lineHeight: 1.25,
            marginBottom: "20px",
          }}>
            Bergabunglah<br />
            <em style={{ color: "var(--gold)" }}>bersama kami.</em>
          </p>
          <p style={{
            fontSize: "13px", fontWeight: 300,
            color: "rgba(245,240,232,0.5)",
            lineHeight: 1.7, maxWidth: "300px",
          }}>
            Daftar sebagai bagian dari tim BurhanSawit dan mulai kelola tugas harian Anda.
          </p>
        </div>

        <div style={{ fontSize: "11px", color: "rgba(245,240,232,0.3)", letterSpacing: "0.08em" }}>
          © 2025 BurhanSawit
        </div>
      </div>

      {/* Right — form */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "center", padding: "60px",
        overflowY: "auto",
      }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <div style={{ marginBottom: "40px" }}>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "34px", fontWeight: 400,
              color: "var(--text-dark)", marginBottom: "8px",
            }}>
              Buat akun baru
            </h1>
            <p style={{ fontSize: "13px", fontWeight: 300, color: "var(--text-light)" }}>
              Isi informasi di bawah untuk memulai
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <Input label="Nama Lengkap" placeholder="Budi Santoso" value={form.name}
              onChange={(e) => set("name", e.target.value)} required />
            <Input label="Email" type="email" placeholder="nama@email.com" value={form.email}
              onChange={(e) => set("email", e.target.value)} required />
            <Input label="Password" type="password" placeholder="Min. 8 karakter" value={form.password}
              onChange={(e) => set("password", e.target.value)} required minLength={8} />

            {/* Role selector */}
            <div>
              <label style={{
                display: "block", marginBottom: "10px",
                fontSize: "11px", fontWeight: 500,
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: "var(--text-mid)",
              }}>
                Peran
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {ROLES.map((r) => (
                  <label key={r.value} style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "12px 16px",
                    background: form.role === r.value ? "var(--forest)" : "var(--white)",
                    border: `1px solid ${form.role === r.value ? "var(--forest)" : "var(--sand)"}`,
                    borderRadius: "4px", cursor: "pointer",
                    transition: "all 0.2s",
                  }}>
                    <input type="radio" name="role" value={r.value}
                      checked={form.role === r.value}
                      onChange={() => set("role", r.value)}
                      style={{ display: "none" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: "13px", fontWeight: 400,
                        color: form.role === r.value ? "var(--cream)" : "var(--text-dark)",
                      }}>
                        {r.label}
                      </div>
                      <div style={{
                        fontSize: "11px", marginTop: "2px",
                        color: form.role === r.value ? "rgba(245,240,232,0.6)" : "var(--text-light)",
                      }}>
                        {r.desc}
                      </div>
                    </div>
                    {form.role === r.value && (
                      <div style={{
                        width: "18px", height: "18px", borderRadius: "50%",
                        background: "var(--gold)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "10px", color: "var(--forest)", fontWeight: 600,
                      }}>✓</div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div style={{
                padding: "12px 16px",
                background: "#8b2e2e11", border: "1px solid #8b2e2e44",
                borderRadius: "4px", fontSize: "13px", color: "var(--error)",
              }}>
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} style={{ width: "100%", justifyContent: "center" }}>
              Buat Akun
            </Button>
          </form>

          <p style={{
            marginTop: "28px", textAlign: "center",
            fontSize: "13px", fontWeight: 300, color: "var(--text-light)",
          }}>
            Sudah punya akun?{" "}
            <Link href="/login" style={{
              color: "var(--forest-mid)", textDecoration: "none",
              fontWeight: 400, borderBottom: "1px solid var(--forest-light)",
            }}>
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}