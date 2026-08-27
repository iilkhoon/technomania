'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="az">
      <body className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 antialiased font-sans">
        <div className="max-w-lg w-full bg-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-700 text-center">
          <div className="w-16 h-16 bg-rose-900/40 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">ERP Sistem Xətası</h1>
          <p className="text-xs sm:text-sm text-slate-400 mb-4">
            Mərkəzi verilənlər bazası və ya API ilə əlaqə qurulmadı.
          </p>

          {error?.message && (
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700 text-[11px] font-mono text-slate-300 mb-6 text-left truncate">
              {error.message}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (typeof window !== 'undefined') window.location.reload();
                else reset();
              }}
              className="flex-1 bg-[#4f533b] hover:bg-[#3e4230] text-white font-bold text-sm py-3 px-6 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <span>Səhifəni Yenilə</span>
            </button>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') window.location.href = '/';
              }}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm py-3 px-6 rounded-xl transition-all cursor-pointer"
            >
              <span>Ana Səhifə</span>
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
