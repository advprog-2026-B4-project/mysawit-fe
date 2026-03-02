import apiClient from "@/lib/api/client";

export type UserRole = "ADMIN" | "MANDOR" | "BURUH" | "SUPIR";

export interface UserDTO {
  userId: string;
  username: string;
  name: string;
  role: UserRole;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface AuthTokenDTO {
  accessToken: string;
  tokenType: "Bearer";
  role: UserRole;
}

export interface GoogleOAuthUrlResponse {
  authorizationUrl: string;
  state: string;
}

export interface GoogleOAuthCallbackRequest {
  code: string;
  state: string;
}

export const authApi = {
  loginWithEmail: async (payload: LoginRequest): Promise<AuthTokenDTO> => {
    const { data } = await apiClient.post<AuthTokenDTO>("/api/auth/login", payload);
    return data;
  },

  registerUser: async (payload: RegisterRequest): Promise<UserDTO> => {
    const { data } = await apiClient.post<UserDTO>("/api/auth/register", payload);
    return data;
  },

  getGoogleOAuthUrl: async (): Promise<GoogleOAuthUrlResponse> => {
    const { data } = await apiClient.get<GoogleOAuthUrlResponse>("/api/auth/oauth2/google/url");
    return data;
  },

  handleGoogleOAuthCallback: async (payload: GoogleOAuthCallbackRequest): Promise<AuthTokenDTO> => {
    const { data } = await apiClient.post<AuthTokenDTO>("/api/auth/oauth2/google/callback", payload);
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/api/auth/logout");
    if (typeof window !== "undefined") delete window.__mysawit_access_token;
  },

  getCurrentUser: async (): Promise<UserDTO> => {
    const { data } = await apiClient.get<UserDTO>("/api/users/me");
    return data;
  },

  getUserById: async (userId: string): Promise<UserDTO> => {
    const { data } = await apiClient.get<UserDTO>(`/api/users/${userId}`);
    return data;
  },

  listUsers: async (roleFilter?: UserRole): Promise<UserDTO[]> => {
    const { data } = await apiClient.get<UserDTO[]>("/api/users", {
      params: roleFilter ? { role: roleFilter } : undefined,
    });
    return data;
  },

  editUser: async (userId: string, payload: Partial<RegisterRequest>): Promise<UserDTO> => {
    const { data } = await apiClient.put<UserDTO>(`/api/users/${userId}`, payload);
    return data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/api/users/${userId}`);
  },

  assignBuruhToMandor: async (buruhId: string, mandorId: string): Promise<void> => {
    await apiClient.post(`/api/users/buruh/${buruhId}/assign`, { mandorId });
  },

  getBuruhByMandorId: async (mandorId: string): Promise<UserDTO[]> => {
    const { data } = await apiClient.get<UserDTO[]>(`/api/users/mandor/${mandorId}/buruh`);
    return data;
  },
} as const;
