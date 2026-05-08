import { useMutation } from '@tanstack/react-query';
import { panenApi } from '../api/panenApi';
import { extractErrorMessage, notify } from '@/lib/toast';
import toast from 'react-hot-toast';


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
      const urls: string[] = [];
      
      for (const file of files) {
        const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
        const MAX_SIZE = 5 * 1024 * 1024;

        if (!ALLOWED_TYPES.includes(file.type)) {
          throw new Error(`${file.name}: hanya JPG dan PNG.`);
        }
        if (file.size > MAX_SIZE) {
          throw new Error(`${file.name}: maks 5MB.`);
        }

        const url = await uploadPhoto(file);
        urls.push(url);
        toast.success(`${file.name} berhasil.`);
      }
      
      return urls;
    },
  });
};