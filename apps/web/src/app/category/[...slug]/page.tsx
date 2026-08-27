import React, { Suspense } from 'react';
import CategoryClient from './CategoryClient';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string[] }> | { slug: string[] } }) {
  const resolvedParams = await params;
  const slugs = resolvedParams.slug || [];

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-slate-500 font-bold text-sm">
        Kateqoriya məhsulları yüklənir...
      </div>
    }>
      <CategoryClient slugs={slugs} />
    </Suspense>
  );
}
