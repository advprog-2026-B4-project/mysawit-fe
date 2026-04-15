import {
  toast,
  type Toast,
  type ToastOptions,
  type ValueOrFunction,
  type Renderable,
} from "react-hot-toast";

type ToastText = ValueOrFunction<Renderable, Toast>;

type PromiseMessages<T> = {
  loading: ToastText;
  success: ValueOrFunction<Renderable, T>;
  error: ValueOrFunction<Renderable, unknown>;
};

const DEFAULT_OPTIONS: ToastOptions = {
  duration: 4200,
};

export const notify = {
  success(message: ToastText, options?: ToastOptions) {
    return toast.success(message, { ...DEFAULT_OPTIONS, ...options });
  },

  error(message: ToastText, options?: ToastOptions) {
    return toast.error(message, { ...DEFAULT_OPTIONS, ...options });
  },

  info(message: ToastText, options?: ToastOptions) {
    return toast(message, { ...DEFAULT_OPTIONS, ...options });
  },

  loading(message: ToastText, options?: ToastOptions) {
    return toast.loading(message, { ...DEFAULT_OPTIONS, ...options });
  },

  promise<T>(
    promise: Promise<T>,
    messages: PromiseMessages<T>,
    options?: {
      loading?: ToastOptions;
      success?: ToastOptions;
      error?: ToastOptions;
    }
  ) {
    return toast.promise(promise, messages, options);
  },

  dismiss(toastId?: string) {
    toast.dismiss(toastId);
  },

  remove(toastId?: string) {
    toast.remove(toastId);
  },
};

export type Notify = typeof notify;

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
