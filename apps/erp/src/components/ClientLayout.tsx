'use client';

import React, { useState, useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';

import DynamicFaviconManager from './DynamicFaviconManager';
import GlobalShortcuts from './GlobalShortcuts';
import CommandPalette from './CommandPalette';
import ToastManager from './ToastManager';
import { isERPLoggedIn } from '../lib/erpAuth';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login' || pathname.startsWith('/login') || pathname.includes('/login');

  // null = not yet checked, true = authenticated, false = not authenticated
  const [authReady, setAuthReady] = useState<boolean | null>(null);

  // useLayoutEffect runs synchronously before paint — no flash possible
  useLayoutEffect(() => {
    // Self-healing ChunkLoadError recovery
    const handleChunkError = (e: ErrorEvent | PromiseRejectionEvent) => {
      const errorMsg = (e as any)?.message || (e as any)?.reason?.message || '';
      if (
        errorMsg.includes('ChunkLoadError') ||
        errorMsg.includes('Failed to load chunk') ||
        errorMsg.includes('Loading chunk') ||
        errorMsg.includes('CSS_CHUNK_LOAD_FAILED')
      ) {
        console.warn('Recovering from ChunkLoadError by reloading page...');
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }
    };

    window.addEventListener('error', handleChunkError);
    window.addEventListener('unhandledrejection', handleChunkError);

    if (isLoginPage) {
      setAuthReady(true);
      return () => {
        window.removeEventListener('error', handleChunkError);
        window.removeEventListener('unhandledrejection', handleChunkError);
      };
    }

    const loggedIn = isERPLoggedIn();
    if (!loggedIn) {
      const loginPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/erp')
        ? '/erp/login'
        : '/login';
      window.location.replace(loginPath);
    } else {
      setAuthReady(true);
    }

    return () => {
      window.removeEventListener('error', handleChunkError);
      window.removeEventListener('unhandledrejection', handleChunkError);
    };
  }, [isLoginPage]);

  // Render nothing until auth check is complete — prevents any content flash
  if (authReady === null && !isLoginPage) {
    return null;
  }

  if (isLoginPage) {
    return (
      <main className="min-h-screen bg-[#f8fafc] text-slate-900">
        <DynamicFaviconManager />
        <GlobalShortcuts />
        <CommandPalette />
        <ToastManager />
        {children}
      </main>
    );
  }

  return (
    <div className="h-screen flex w-full bg-[#f8fafc] overflow-hidden">
      <DynamicFaviconManager />
      <GlobalShortcuts />
      <CommandPalette />
      <ToastManager />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#f8fafc]">
        <Header />
        <main className="flex-1 p-3.5 sm:p-5 lg:p-7 overflow-x-hidden overflow-y-auto bg-[#f8fafc] text-slate-900 scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
