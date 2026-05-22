export function extractErrorMessage(error: unknown, fallback = "Terjadi kesalahan. Silakan coba lagi.") {
  if (error instanceof Error) {
    const message = error.message.trim();
    if (message) {
      return message;
    }
  }

  if (typeof error === "string") {
    const message = error.trim();
    if (message) {
      return message;
    }
  }

  return fallback;
}