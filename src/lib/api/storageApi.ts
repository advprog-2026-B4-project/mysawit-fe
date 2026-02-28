import apiClient from "@/lib/api/client";

export interface FileUploadResponse {
  fileKey: string;
  publicUrl: string;
  fileName: string;
  fileSize: number;
}

export const storageApi = {
  uploadFile: async (file: File): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    
    const { data } = await apiClient.post<FileUploadResponse>(
      "/api/storage/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return data;
  },

  deleteFile: async (fileKey: string): Promise<void> => {
    await apiClient.delete(`/api/storage/${fileKey}`);
  },

  getPublicUrl: (fileKey: string): string => {
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/storage/${fileKey}`;
  },
} as const;
