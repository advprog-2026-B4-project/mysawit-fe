import { useRouter } from "next/navigation";
import { authApi, type LoginRequest, type RegisterRequest } from "../api/authApi";
import { initiateGoogleLogin, handleGoogleCallback } from "../utils/googleOAuthHelper";

const ROLE_ROUTES: Record<string, string> = {
  ADMIN:  "/admin/users",
  MANDOR: "/mandor",
  BURUH:  "/buruh",
  SUPIR:  "/supir",
};

export function useAuth() {
  const router = useRouter();

  const loginWithEmail = async (credentials: LoginRequest) => {
    const { accessToken, role } = await authApi.loginWithEmail(credentials);
    window.__mysawit_access_token = accessToken;
    router.push(ROLE_ROUTES[role] ?? "/login"); 
    return { accessToken, role };
  };

  const register = async (data: RegisterRequest) => {
    const user = await authApi.registerUser(data);
    return user;
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
    await authApi.logout();
    router.push("/login");
  };

  const getToken = (): string | undefined => {
    if (typeof window !== "undefined") {
      return window.__mysawit_access_token;
    }
    return undefined;
  };

  const isAuthenticated = (): boolean => {
    return !!getToken();
  };

  return {
    loginWithEmail,
    register,
    loginWithGoogle,
    handleOAuthCallback,
    logout,
    getToken,
    isAuthenticated,
  };
}