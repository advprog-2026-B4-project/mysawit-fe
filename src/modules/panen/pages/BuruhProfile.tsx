'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import BuruhPanenSection from '../components/BuruhPanenSection';

export default function BuruhProfilePage() {
  const { userId } = useParams<{ userId: string }>();

  return (
    <div className="max-w-[900px]">
      <Link
        href="/mandor/panen"
        className="inline-flex items-center gap-1.5 text-[12px] tracking-[0.06em] text-text-light no-underline mb-8 uppercase hover:text-text-dark transition-colors"
      >
        {'<-'} Kembali
      </Link>

      <BuruhPanenSection buruhId={userId} />
    </div>
  );
}