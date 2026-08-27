'use client';

import React, { useEffect } from 'react';
import { Database, RotateCcw, Home, RefreshCw } from '../components/HeroIconsHub';

export default function ERPError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('ERP Panel Runtime/DB Error caught by ErrorBoundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 antialiased text-white">
      <div className="max-w-lg w-full bg-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-700 text-center relative overflow-hidden">
        {/* Top Accent Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-rose-500 to-[#4f533b]" />

        {/* Warning Icon Badge */}
        <div className="w-20 h-20 bg-rose-900/40 border-2 border-rose-500/30 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner relative">
          <Database className="w-9 h-9 text-rose-400 animate-pulse" />
          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold">
            !
          </span>
        </div>

        {/* Error Titles */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          ERP Mərkəzi Baza Xətası
        </h1>
        <p className="text-sm font-semibold text-rose-400 mb-4">
          PostgreSQL və ya NestJS API ilə əlaqə qurulmadı
        </p>

        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
          İdarəetmə paneli mərkəzi serverlə əlaqə qura bilmir. Zəhmət olmasa PostgreSQL servisinin və ya arxa plan API prosesinin işlək olduğunu yoxlayın.
        </p>

        {/* Error Details Chip */}
        <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-3 mb-8 text-left">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 tracking-wider mb-1">
            <span>Status / Xəta</span>
            <span className="font-mono text-rose-400">{error?.name || 'RUNTIME_ERROR'}</span>
          </div>
          <p className="text-[11px] font-mono text-slate-300 truncate" title={error?.message || 'Sistem əməliyyat xətası'}>
            {error?.message || 'Sistem xətası baş verdi'}
          </p>
          {error?.digest && (
            <p className="text-[10px] font-mono text-slate-500 mt-1">Digest: {error.digest}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:flex-1 bg-[#4f533b] hover:bg-[#3e4230] text-white font-bold text-sm py-3.5 px-5 rounded-2xl shadow-lg shadow-[#4f533b]/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Yenidən yoxla</span>
          </button>

          <button
            onClick={() => window.location.href = '/erp'}
            className="w-full sm:flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm py-3.5 px-5 rounded-2xl border border-slate-600 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>ERP Əsas Səhifə</span>
          </button>
        </div>
      </div>
    </div>
  );
}
