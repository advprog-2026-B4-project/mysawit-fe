const TOKEN_KEY = "mysawit_token";
const ROLE_KEY  = "mysawit_role";
const MAX_AGE   = 60 * 60 * 24; // 1 day in seconds

export function saveAuth(token: string, role: string): void {
  if (typeof document === "undefined") return;
  const opts = `path=/; max-age=${MAX_AGE}; SameSite=Strict`;
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; ${opts}`;
  document.cookie = `${ROLE_KEY}=${encodeURIComponent(role)}; ${opts}`;
  if (typeof window !== "undefined") window.__mysawit_access_token = token;
}

export function getToken(): string | undefined {
  return readCookie(TOKEN_KEY);
}

export function getRole(): string | undefined {
  return readCookie(ROLE_KEY);
}

export function getUserIdFromToken(): string | undefined {
  const token = getToken();
  if (!token) return undefined;

  const parts = token.split(".");
  if (parts.length < 2) return undefined;

  try {
    const payload = JSON.parse(decodeBase64Url(parts[1])) as { sub?: unknown };
    return typeof payload.sub === "string" ? payload.sub : undefined;
  } catch {
    return undefined;
  }
}

export function clearAuth(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
  document.cookie = `${ROLE_KEY}=; path=/; max-age=0`;
  if (typeof window !== "undefined") delete window.__mysawit_access_token;
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : undefined;
}

function decodeBase64Url(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4 || 4)) % 4, "=");

  if (typeof window !== "undefined" && typeof window.atob === "function") {
    return window.atob(padded);
  }
  return "";
}
