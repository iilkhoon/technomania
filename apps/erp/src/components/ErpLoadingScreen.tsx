'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function ErpLoadingScreen() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isInitialFading, setIsInitialFading] = useState(false);
  const [isRouteNavigating, setIsRouteNavigating] = useState(false);

  const [logoUrl, setLogoUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const cached = (window as any).__CACHED_ERP_LOGO_URL__ || (window as any).__CACHED_LOGO_URL__;
      if (cached) return cached;
      try {
        const saved = localStorage.getItem('technomania_site_settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          const l = parsed.erpLogoUrl || parsed.logoUrl;
          if (l) return l;
        }
      } catch (e) {}
    }
    return '/logo.webp';
  });

  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = (window as any).__CACHED_ERP_LOGO_URL__ || (window as any).__CACHED_LOGO_URL__;
      if (cached) {
        setLogoUrl(cached);
      }
    }

    fetch('/api/catalog/settings', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        const l = data?.erpLogoUrl || data?.logoUrl;
        if (l) setLogoUrl(l);
      })
      .catch(() => {});

    // Initial Splash Screen Timer: smooth and quick
    const fadeTimer = setTimeout(() => {
      setIsInitialFading(true);
    }, 250);

    const hideTimer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 450);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  // Monitor Route Changes - clear route navigation overlay quickly
  useEffect(() => {
    setIsRouteNavigating(false);
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
        // Fail-safe timeout: always hide overlay after 600ms
        setTimeout(() => {
          setIsRouteNavigating(false);
        }, 600);
      }
    };

    document.addEventListener('click', handleLinkClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleLinkClick, { capture: true });
    };
  }, []);

  if (!isInitialLoading && !isRouteNavigating) {
    return null;
  }

  return (
    <>
      {/* ── Route Navigation Overlay ── */}
      {isRouteNavigating && (
        <div
          suppressHydrationWarning
          className="fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-white/80 backdrop-blur-xs transition-opacity duration-150 pointer-events-none"
        >
          <img
            src={logoUrl || '/logo.webp'}
            alt="Logo"
            loading="eager"
            decoding="sync"
            className="h-12 sm:h-14 w-auto object-contain animate-pulse duration-400 drop-shadow-sm"
          />
        </div>
      )}

      {/* ── Initial App Launch Splash Screen ── */}
      {isInitialLoading && (
        <div
          suppressHydrationWarning
          className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white transition-all duration-200 ease-out pointer-events-none ${
            isInitialFading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
          }`}
        >
          <div suppressHydrationWarning className="relative z-10 flex flex-col items-center justify-center p-6">
            <img
              src={logoUrl || '/logo.webp'}
              alt="Logo"
              loading="eager"
              decoding="sync"
              className="h-14 sm:h-16 max-w-[240px] w-auto object-contain drop-shadow-sm animate-pulse duration-500"
            />
          </div>
        </div>
      )}
    </>
  );
}
