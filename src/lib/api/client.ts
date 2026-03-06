import axios from "axios";
import type { ApiResponse } from "./types";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined" && window.__mysawit_access_token) {
    config.headers.Authorization = `Bearer ${window.__mysawit_access_token}`;
  }
  return config;
});

// Unwrap ApiResponse<T> automatically
apiClient.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResponse<unknown>;
    if (body && typeof body === "object" && "success" in body) {
      if (!body.success) {
        return Promise.reject(new Error(body.message ?? "Request failed"));
      }
      // Return unwrapped data so API functions get inner payload directly
      response.data = body.data;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        delete window.__mysawit_access_token;
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;