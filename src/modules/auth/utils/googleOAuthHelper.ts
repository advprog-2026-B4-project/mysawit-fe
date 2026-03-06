import { authApi } from "@/modules/auth/api/authApi";
import { saveAuth } from "@/lib/api/tokenStorage";

/**
 * Initiate Google OAuth login - redirects to Google.
 */
export async function initiateGoogleLogin() {
  const { authorizationUrl } = await authApi.getGoogleOAuthUrl();
  window.location.href = authorizationUrl;
}

/**
 * Handle OAuth callback - exchanges code for JWT and stores token.
 * Returns user role or null on failure.
 */
export async function handleGoogleCallback(searchParams: URLSearchParams): Promise<string | null> {
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) return null;

  try {
    const { accessToken, role } = await authApi.handleGoogleOAuthCallback(code, state);
    saveAuth(accessToken, role);
    return role;
  } catch {
    return null;
  }
}
