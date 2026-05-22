export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: Record<string, string>;
  timestamp: string;
}

export function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new Error(response.message ?? "Request failed");
  }
  return response.data as T;
}