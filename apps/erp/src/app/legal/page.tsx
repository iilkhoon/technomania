'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LegalIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/erp/legal/privacy');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-slate-500 font-bold">
      Hüquqi sənədlər yüklənir...
    </div>
  );
}
