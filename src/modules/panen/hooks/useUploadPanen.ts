import { useMutation } from '@tanstack/react-query';
import { panenApi } from '../api/panenApi';
import { extractErrorMessage, notify } from '@/lib/toast';
import { toast } from 'react-hot-toast';


export const useUploadPanenPhoto = () => {
  return useMutation({
    mutationFn: (file: File) => panenApi.uploadPhoto(file),
    onError: (error: unknown) => {
      notify.error(extractErrorMessage(error, 'Gagal mengupload foto.'));
    },
  });
};

export const useUploadPanenPhotos = () => {
  const { mutateAsync: uploadPhoto } = useUploadPanenPhoto();

  return useMutation({
    mutationFn: async (files: File[]): Promise<string[]> => {
      const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png']);
      const MAX_SIZE = 5 * 1024 * 1024;

      for (const file of files) {
        if (!ALLOWED_TYPES.has(file.type)) {
          throw new Error(`${file.name}: hanya JPG dan PNG.`);
        }
        if (file.size > MAX_SIZE) {
          throw new Error(`${file.name}: maks 5MB.`);
        }
      }

      const urls = await Promise.all(
        files.map((file) => uploadPhoto(file))
      );

      files.forEach((file) => toast.success(`${file.name} berhasil.`));
      return urls;
    },
  });
};