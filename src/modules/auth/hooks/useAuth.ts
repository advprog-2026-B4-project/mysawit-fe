import { useRouter } from "next/navigation";
import { authApi, type LoginRequest, type OAuthCompleteRegistrationRequest, type RegisterRequest } from "../api/authApi";
import { initiateGoogleLogin, handleGoogleCallback } from "../utils/googleOAuthHelper";
import { saveAuth, clearAuth, getToken, getRole } from "@/lib/api/tokenStorage";

export const ROLE_ROUTES: Record<string, string> = {
  ADMIN:  "/admin/users",
  MANDOR: "/mandor",
  BURUH:  "/buruh",
  SUPIR:  "/supir",
};

export function useAuth() {
  const router = useRouter();

  const loginWithEmail = async (credentials: LoginRequest) => {
    const { accessToken, role } = await authApi.loginWithEmail(credentials);
    saveAuth(accessToken, role);
    router.push(ROLE_ROUTES[role] ?? "/login");
    return { accessToken, role };
  };

  const register = async (data: RegisterRequest) => {
    const user = await authApi.registerUser(data);
    return user;
  };

  const completeOAuthRegistration = async (data: OAuthCompleteRegistrationRequest) => {
    const { accessToken, role } = await authApi.completeGoogleOAuthRegistration(data);
    saveAuth(accessToken, role);
    router.push(ROLE_ROUTES[role] ?? "/login");
    return { accessToken, role };
  };

  const loginWithGoogle = async () => {
    await initiateGoogleLogin();
  };

  const handleOAuthCallback = async (searchParams: URLSearchParams) => {
    const role = await handleGoogleCallback(searchParams);
    if (role) {
      router.push(ROLE_ROUTES[role] ?? "/login");
    } else {
      router.push("/login");
    }
    return role;
  };

  const logout = async () => {
    try { await authApi.logout(); } catch { /* ignore network errors on logout */ }
    clearAuth();
    router.push("/login");
  };

  const isAuthenticated = (): boolean => {
    return !!getToken();
  };

  const getStoredRole = (): string | undefined => {
    return getRole();
  };

  return {
    loginWithEmail,
    register,
    loginWithGoogle,
    handleOAuthCallback,
    completeOAuthRegistration,
    logout,
    isAuthenticated,
    getStoredRole,
  };
}