'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PurchasesIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/erp/purchases/suppliers');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-slate-500 font-bold">
      Təchizat modulu yüklənir...
    </div>
  );
}
