'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from './HeroIconsHub';
import { ToastItem } from '../lib/toastStore';

export default function ToastManager() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<ToastItem>;
      if (customEvent.detail) {
        const item = customEvent.detail;
        setToasts(prev => [...prev, item]);

        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== item.id));
        }, 3500);
      }
    };

    window.addEventListener('techno_show_toast', handleToast);
    return () => window.removeEventListener('techno_show_toast', handleToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 space-y-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className="pointer-events-auto p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-xl flex items-center justify-between gap-3 text-xs text-slate-800 animate-fadeIn"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
            {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
            {t.type === 'info' && <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />}
            <span className="font-medium truncate">{t.message}</span>
          </div>

          <button
            onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
            className="p-1 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
