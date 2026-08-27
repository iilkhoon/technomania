'use client';

import React from 'react';
import { Card, Skeleton } from '@heroui/react';

export default function ProductSkeletonCard({ isDarkMode = false }: { isDarkMode?: boolean }) {
  return (
    <Card
      className={`rounded-2xl border p-4 flex flex-col justify-between h-[420px] shadow-xs ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'
      }`}
    >
      <div>
        {/* Badges row skeleton */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Skeleton className="h-4 w-16 rounded-md" />
          <Skeleton className="h-4 w-10 rounded-md" />
        </div>

        {/* Image skeleton */}
        <Skeleton className="w-full h-44 rounded-xl mb-4" />

        {/* Title skeleton */}
        <div className="space-y-2 mb-4">
          <Skeleton className="h-3.5 w-5/6 rounded-md" />
          <Skeleton className="h-3.5 w-3/4 rounded-md" />
        </div>

        {/* Segment control skeleton */}
        <div className={`p-1 rounded-xl flex gap-1 mb-3 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <Skeleton className="h-6 flex-1 rounded-lg" />
          <Skeleton className="h-6 flex-1 rounded-lg" />
          <Skeleton className="h-6 flex-1 rounded-lg" />
        </div>

        {/* Price skeleton */}
        <Skeleton className="h-6 w-28 mx-auto rounded-lg" />
      </div>

      {/* Buttons row skeleton */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <Skeleton className="h-9 w-9 rounded-xl flex-shrink-0" />
        <Skeleton className="h-9 w-9 rounded-xl flex-shrink-0" />
        <Skeleton className="h-9 flex-1 rounded-xl" />
      </div>
    </Card>
  );
}
