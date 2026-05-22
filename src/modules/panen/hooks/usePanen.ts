// src/modules/panen/hooks/usePanen.ts
import { useQuery } from '@tanstack/react-query';
import { panenApi, GetPanenByBuruhParams } from '../api/panenApi';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const panenKeys = {
  all: ['panen'] as const,
  detail: (panenId: string) => [...panenKeys.all, 'detail', panenId] as const,
  byBuruh: (buruhId: string, params?: GetPanenByBuruhParams) =>
    [...panenKeys.all, 'buruh', buruhId, params] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Ambil detail satu panen berdasarkan ID.
 */
export const usePanenDetail = (panenId: string) => {
  return useQuery({
    queryKey: panenKeys.detail(panenId),
    queryFn: () => panenApi.getPanenById(panenId),
    enabled: !!panenId,
  });
};

/**
 * Ambil daftar panen milik satu buruh — dipakai Admin saat lihat profil buruh.
 */
export const usePanenByBuruh = (
  buruhId: string,
  params?: GetPanenByBuruhParams
) => {
  return useQuery({
    queryKey: panenKeys.byBuruh(buruhId, params),
    queryFn: () => panenApi.getPanenByBuruhId(buruhId, params),
    enabled: !!buruhId,
  });
};