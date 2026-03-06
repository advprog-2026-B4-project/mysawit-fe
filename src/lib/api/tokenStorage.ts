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
