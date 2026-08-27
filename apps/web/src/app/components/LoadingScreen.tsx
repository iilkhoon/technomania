'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function LoadingScreen() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isInitialFading, setIsInitialFading] = useState(false);
  const [isRouteNavigating, setIsRouteNavigating] = useState(false);

  // Initialize with cached logo or instant static logo file
  const [logoUrl, setLogoUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const cached = (window as any).__CACHED_LOGO_URL__ || (window as any).__CACHED_ERP_LOGO_URL__;
      if (cached) return cached;
      try {
        const saved = localStorage.getItem('technomania_site_settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          const l = parsed.logoUrl || parsed.erpLogoUrl;
          if (l) return l;
        }
      } catch (e) {}
    }
    return '/logo.webp';
  });

  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Resolve Storefront Navbar Logo
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = (window as any).__CACHED_LOGO_URL__ || (window as any).__CACHED_ERP_LOGO_URL__;
      if (cached) {
        setLogoUrl(cached);
      } else {
        try {
          const saved = localStorage.getItem('technomania_site_settings');
          if (saved) {
            const parsed = JSON.parse(saved);
            const l = parsed.logoUrl || parsed.erpLogoUrl;
            if (l) setLogoUrl(l);
          }
        } catch (e) {}
      }
    }

    // Secondary background fetch to sync if changed
    fetch('/api/catalog/settings', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        const l = data?.logoUrl || data?.erpLogoUrl;
        if (l) setLogoUrl(l);
      })
      .catch(() => {});

    // Initial Splash Screen Timer: smooth and quick
    const fadeTimer = setTimeout(() => {
      setIsInitialFading(true);
    }, 450);

    const hideTimer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 650);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  // Monitor Route Changes - activate loading overlay on navigation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRouteNavigating(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      if (
        href.startsWith('/') &&
        !href.startsWith('//') &&
        !target.getAttribute('target')
      ) {
        if (href === window.location.pathname + window.location.search) return;
        setIsRouteNavigating(true);
      }
    };

    document.addEventListener('click', handleLinkClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleLinkClick, { capture: true });
    };
  }, []);

  return (
    <>
      {/* ── Route Navigation Overlay — ONLY PURE ANIMATED LOGO ── */}
      {isRouteNavigating && (
        <div
          suppressHydrationWarning
          className="fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-white/85 dark:bg-slate-950/85 backdrop-blur-xs transition-opacity duration-200 pointer-events-none"
        >
          <img
            src={logoUrl || '/logo.webp'}
            alt="Logo"
            loading="eager"
            decoding="sync"
            className="h-12 sm:h-16 w-auto object-contain animate-pulse duration-500 drop-shadow-md"
          />
        </div>
      )}

      {/* ── Initial App Launch Splash Screen — ONLY PURE ANIMATED LOGO ── */}
      {isInitialLoading && (
        <div
          suppressHydrationWarning
          className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white dark:bg-[#0f172a] transition-all duration-300 ease-out pointer-events-none ${
            isInitialFading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
          }`}
        >
          <div suppressHydrationWarning className="relative z-10 flex flex-col items-center justify-center p-6">
            <img
              src={logoUrl || '/logo.webp'}
              alt="Logo"
              loading="eager"
              decoding="sync"
              className="h-16 sm:h-22 max-w-[260px] w-auto object-contain drop-shadow-md animate-pulse duration-700"
            />
          </div>
        </div>
      )}
    </>
  );
}
