'use client';

import React from 'react';
import { Database, RotateCcw, Home } from './components/HeroIconsHub';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="az">
      <body className="min-h-screen bg-slate-50 flex items-center justify-center p-4 antialiased font-sans">
        <div className="max-w-lg w-full bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-200 text-center">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Database className="w-8 h-8 text-rose-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Sistem Xətası Baş Verdi</h1>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">
            Mərkəzi verilənlər bazası və ya API ilə əlaqə qurulmadı. Zəhmət olmasa yenidən cəhd edin.
          </p>
          <button
            onClick={() => reset()}
            className="w-full bg-[#4f533b] hover:bg-[#3e4230] text-white font-bold text-sm py-3 px-6 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Yenidən cəhd et</span>
          </button>
        </div>
      </body>
    </html>
  );
}
