import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { authApi, type LoginRequest, type OAuthCompleteRegistrationRequest, type RegisterRequest } from "../api/authApi";
import { initiateGoogleLogin, handleGoogleCallback } from "../utils/googleOAuthHelper";
import { saveAuth, clearAuth, getToken, getRole } from "@/lib/api/tokenStorage";
import { extractErrorMessage, notify } from "@/lib/toast";

export const ROLE_ROUTES: Record<string, string> = {
  ADMIN:  "/admin/users",
  MANDOR: "/mandor",
  BURUH:  "/buruh",
  SUPIR:  "/supir",
};

const register = async (data: RegisterRequest) => {
  try {
    const user = await authApi.registerUser(data);
    notify.success("Registrasi berhasil. Silakan login.");
    return user;
  } catch (error: unknown) {
    notify.error(extractErrorMessage(error, "Gagal melakukan registrasi."));
    throw error;
  }
};

const loginWithGoogle = async () => {
  await initiateGoogleLogin();
};

const isAuthenticated = (): boolean => {
  return !!getToken();
};

const getStoredRole = (): string | undefined => {
  return getRole();
};

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const loginWithEmail = async (credentials: LoginRequest) => {
    try {
      const { accessToken, role } = await authApi.loginWithEmail(credentials);
      saveAuth(accessToken, role);


      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
      queryClient.invalidateQueries({ queryKey: ["panen"] });

      notify.success("Login berhasil.");
      router.push(ROLE_ROUTES[role] ?? "/login");
      return { accessToken, role };
    } catch (error: unknown) {
      notify.error(extractErrorMessage(error, "Gagal login."));
      throw error;
    }
  };

  const completeOAuthRegistration = async (data: OAuthCompleteRegistrationRequest) => {
    try {
      const { accessToken, role } = await authApi.completeGoogleOAuthRegistration(data);
      saveAuth(accessToken, role);

      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
      queryClient.invalidateQueries({ queryKey: ["panen"] });

      notify.success("Registrasi akun Google berhasil.");
      router.push(ROLE_ROUTES[role] ?? "/login");
      return { accessToken, role };
    } catch (error: unknown) {
      notify.error(extractErrorMessage(error, "Gagal menyelesaikan registrasi Google."));
      throw error;
    }
  };

  const handleOAuthCallback = async (searchParams: URLSearchParams) => {
    const role = await handleGoogleCallback(searchParams);

    queryClient.invalidateQueries({ queryKey: ["users", "me"] });
    queryClient.invalidateQueries({ queryKey: ["panen"] });

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
    queryClient.clear();
    notify.success("Anda berhasil keluar.");
    router.push("/login");
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