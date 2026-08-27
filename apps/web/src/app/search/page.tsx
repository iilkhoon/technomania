import React, { Suspense } from 'react';
import SearchClient from './SearchClient';

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-slate-500 font-bold text-sm">
        Axtarış nəticələri yüklənir...
      </div>
    }>
      <SearchClient />
    </Suspense>
  );
}
