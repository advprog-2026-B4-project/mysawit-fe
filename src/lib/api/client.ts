import axios from "axios";
import type { ApiResponse } from "./types";
import { getToken, clearAuth } from "./tokenStorage";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | undefined {
  return value !== null && typeof value === "object" ? (value as UnknownRecord) : undefined;
}

function readNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function extractFieldErrorMessage(payload: unknown): string | undefined {
  const record = asRecord(payload);
  if (!record) {
    return undefined;
  }

  const fieldErrors = asRecord(record.fieldErrors) ?? asRecord(record.errors);
  if (!fieldErrors) {
    return undefined;
  }

  for (const value of Object.values(fieldErrors)) {
    const message = readNonEmptyString(value);
    if (message) {
      return message;
    }
  }

  return undefined;
}

function isGenericMessage(message: string): boolean {
  const normalized = message.trim().toLowerCase();
  return (
    normalized === "validation failed" ||
    normalized === "request failed" ||
    normalized === "bad request"
  );
}

export function extractApiErrorMessage(payload: unknown): string | undefined {
  const directMessage = readNonEmptyString(payload);
  if (directMessage) {
    return directMessage;
  }

  const record = asRecord(payload);
  if (!record) {
    return undefined;
  }

  const message = readNonEmptyString(record.message);
  const detailedFieldError =
    extractFieldErrorMessage(record.data) ??
    extractFieldErrorMessage(record.error) ??
    extractFieldErrorMessage(record);

  if (detailedFieldError && (!message || isGenericMessage(message))) {
    return detailedFieldError;
  }

  return message ?? detailedFieldError;
}

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

// Restore token from cookie on module load so refreshes stay authenticated
if (typeof window !== "undefined") {
  const stored = getToken();
  if (stored) window.__mysawit_access_token = stored;
}

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
        const message = extractApiErrorMessage(body) ?? "Request failed";
        return Promise.reject(new Error(message));
      }
      // Return unwrapped data so API functions get inner payload directly
      response.data = body.data;
    }
    return response;
  },
  (error) => {
    const backendMsg = extractApiErrorMessage(error.response?.data);
    if (error.response?.status === 401) {
      clearAuth();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(new Error(backendMsg ?? error.message ?? "Request failed"));
  }
);

export default apiClient;