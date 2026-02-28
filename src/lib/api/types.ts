export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  error?: unknown;
  timestamp: string;
}

export function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (!response.success || response.data === null) {
    throw new Error(response.message || "Operation failed");
  }
  return response.data;
}
