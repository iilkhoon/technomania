'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreditIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/erp/credit/list');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-slate-500 font-bold">
      Kredit modulu yüklənir...
    </div>
  );
}
