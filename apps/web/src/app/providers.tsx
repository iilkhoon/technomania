'use client';

import React from 'react';
import { RouterProvider } from '@heroui/react';
import { useRouter } from 'next/navigation';
import SmoothScrollProvider from './components/SmoothScrollProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <RouterProvider navigate={router.push}>
      <SmoothScrollProvider>
        {children}
      </SmoothScrollProvider>
    </RouterProvider>
  );
}

