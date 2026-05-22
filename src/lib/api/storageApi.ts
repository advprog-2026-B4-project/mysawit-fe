import apiClient from "@/lib/api/client";

export const storageApi = {
  deleteFile: async (fileKey: string): Promise<void> => {
    await apiClient.delete(`/api/storage/file?fileKey=${encodeURIComponent(fileKey)}`);
  },

  getPublicUrl: (fileKey: string): string => {
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/storage/${fileKey}`;
  },
} as const;
