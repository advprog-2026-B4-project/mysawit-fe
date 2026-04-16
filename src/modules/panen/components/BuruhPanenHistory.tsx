'use client';

import Link from 'next/link';
import BuruhPanenSection from './BuruhPanenSection';
import { useCurrentUser } from '@/modules/auth';
import { Button } from '@/components/ui/Button';

export default function BuruhPanenHistory() {
  const { data: user, isLoading, isError, error, refetch } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="max-w-[900px] p-12">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-48 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="max-w-[900px] p-12">
        <p className="text-[13px] text-error mb-4">
          {error instanceof Error ? error.message : 'Gagal memuat data user.'}
        </p>
        <Button variant="ghost" onClick={() => refetch()} className="px-4 py-2 text-[12px]">
          Coba lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-[900px]">
      <Link
        href="/buruh/dashboard"
        className="inline-flex items-center gap-1.5 text-[12px] tracking-[0.06em] text-text-light no-underline mb-8 uppercase hover:text-text-dark transition-colors"
      >
        {'<-'} Kembali
      </Link>
      <BuruhPanenSection buruhId={user.userId} />
    </div>
  );
}