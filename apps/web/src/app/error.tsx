'use client';

import React, { useEffect } from 'react';
import { Database, AlertTriangle, RotateCcw, Home, PhoneCall, RefreshCw } from './components/HeroIconsHub';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Storefront Runtime/DB Error caught by ErrorBoundary:', error);
  }, [error]);

  const handleHardReload = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('techno_erp_banners');
        window.location.reload();
      }
    } catch (e) {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 antialiased selection:bg-[#4f533b] selection:text-white">
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-200/80 text-center relative overflow-hidden">
        {/* Top Accent Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-rose-500 to-[#4f533b]" />

        {/* Warning Icon Badge */}
        <div className="w-20 h-20 bg-rose-50 border-2 border-rose-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner relative">
          <Database className="w-9 h-9 text-rose-600 animate-pulse" />
          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold">
            !
          </span>
        </div>

        {/* Error Titles */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Müvəqqəti əlaqə fasiləsi
        </h1>
        <p className="text-sm font-semibold text-rose-600 mb-4">
          Səhifə yenilənir...
        </p>

        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
          Səhifə məlumatları yenilənərkən qısa fasilə yarandı. Aşağıdakı "Səhifəni Yenilə" düyməsinə klikləyərək dərhal davam edə bilərsiniz.
        </p>

        {/* Error Details Chip */}
        <div className="bg-slate-100/90 border border-slate-200 rounded-xl p-3 mb-8 text-left">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 tracking-wider mb-1">
            <span>Status</span>
            <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Sistem Aktivdir</span>
          </div>
          <p className="text-[11px] font-mono text-slate-600 break-words line-clamp-2" title={error?.message}>
            {error?.message || 'Yenidən yüklənir...'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleHardReload}
            className="w-full sm:flex-1 bg-[#4f533b] hover:bg-[#3e4230] text-white font-bold text-sm py-3.5 px-5 rounded-2xl shadow-lg shadow-[#4f533b]/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Səhifəni Yenilə</span>
          </button>

          <button
            onClick={() => window.location.href = '/'}
            className="w-full sm:flex-1 bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm py-3.5 px-5 rounded-2xl border border-slate-300 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span>Ana Səhifə</span>
          </button>
        </div>

        {/* Support Direct Call Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
          <PhoneCall className="w-3.5 h-3.5 text-[#4f533b]" />
          <span>Dəstək Xətti:</span>
          <a href="tel:+994502881717" className="text-[#4f533b] hover:underline font-bold">
            +994 (50) 288-17-17
          </a>
        </div>
      </div>
    </div>
  );
}
