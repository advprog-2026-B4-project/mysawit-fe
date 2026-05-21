import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { extractErrorMessage, notify } from "@/lib/toast";

type KeyOrFn<TData> = QueryKey | ((data: TData) => QueryKey);

interface CreateMutationConfig<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  invalidateKeys?: KeyOrFn<TData> | KeyOrFn<TData>[];
  successMessage?: string | ((data: TData) => string);
  errorMessage?: string;
  onSuccess?: (data: TData, queryClient: ReturnType<typeof useQueryClient>) => void | Promise<void>;
  onError?: (error: Error) => void;
}

function resolveKeys<TData>(
  keys: KeyOrFn<TData> | KeyOrFn<TData>[],
  data: TData
): QueryKey[] {
  const list = Array.isArray(keys) ? keys : [keys];
  return list.map((k) => (typeof k === "function" ? k(data) : k));
}

export function createMutation<TData = unknown, TVariables = void>(
  config: CreateMutationConfig<TData, TVariables>
) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: config.mutationFn,
    onSuccess: async (data) => {
      if (config.invalidateKeys) {
        const keys = resolveKeys(config.invalidateKeys, data);
        await Promise.all(keys.map((key) => queryClient.invalidateQueries({ queryKey: key })));
      }
      if (config.successMessage) {
        const msg =
          typeof config.successMessage === "function"
            ? config.successMessage(data)
            : config.successMessage;
        notify.success(msg);
      }
      if (config.onSuccess) {
        await config.onSuccess(data, queryClient);
      }
    },
    onError: (error: Error) => {
      notify.error(extractErrorMessage(error, config.errorMessage ?? "Terjadi kesalahan."));
      if (config.onError) {
        config.onError(error);
      }
    },
  });
}
