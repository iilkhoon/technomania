'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ShoppingBagIcon,
  HeartIcon,
  ArrowsRightLeftIcon,
  XMarkIcon,
  CheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Button } from '@heroui/react';

export interface ToastData {
  id: string;
  type: 'cart' | 'fav' | 'compare' | 'coupon' | 'info' | 'success';
  title: string;
  subtitle?: string;
  image?: string;
  actionLabel?: string;
  actionUrl?: string;
}

export default function ToastNotifier() {
  const router = useRouter();
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = (toast: Omit<ToastData, 'id'>) => {
    // Deduplication: if identical toast exists in last 800ms, ignore duplicate
    const now = Date.now();
    const isDuplicate = toasts.some(
      (t) => t.type === toast.type && t.title === toast.title
    );
    if (isDuplicate) return;

    const id = `${now}-${Math.random().toString(36).substring(2, 9)}`;
    const newToast: ToastData = { ...toast, id };
    setToasts((prev) => [newToast, ...prev.slice(0, 2)]);

    setTimeout(() => {
      removeToast(id);
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    let lastEventTime = 0;
    let lastEventKey = '';

    const handleToastEvent = (e: CustomEvent<Omit<ToastData, 'id'>>) => {
      if (e.detail) {
        const key = `${e.detail.type}-${e.detail.title}-${e.detail.subtitle}`;
        const now = Date.now();
        if (key === lastEventKey && now - lastEventTime < 600) {
          return; // debounce duplicate event within 600ms
        }
        lastEventTime = now;
        lastEventKey = key;
        addToast(e.detail);
      }
    };

    window.addEventListener('techno_toast' as any, handleToastEvent);
    return () => {
      window.removeEventListener('techno_toast' as any, handleToastEvent);
    };
  }, []);

  return (
    <div className="fixed top-5 sm:top-6 right-4 sm:right-6 z-[999999] flex flex-col gap-2.5 max-w-[340px] sm:max-w-[360px] w-full pointer-events-none select-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => {
          const isFav = t.type === 'fav';
          const isCart = t.type === 'cart';
          const isCompare = t.type === 'compare';

          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -24, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, y: -16, scale: 0.9, x: 40, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              className="pointer-events-auto relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.14)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] flex items-center gap-3 group"
            >
              {/* Type Icon Badge */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs ${
                  isFav
                    ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/50'
                    : isCart
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50'
                    : isCompare
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/50'
                    : 'bg-[#4f533b]/10 text-[#4f533b] dark:text-[#a3a886] border border-[#4f533b]/20'
                }`}
              >
                {isFav ? (
                  <HeartSolidIcon className="w-5 h-5 animate-scaleUp" />
                ) : isCart ? (
                  <ShoppingBagIcon className="w-5 h-5" />
                ) : isCompare ? (
                  <ArrowsRightLeftIcon className="w-5 h-5" />
                ) : (
                  <SparklesIcon className="w-5 h-5" />
                )}
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0 pr-1">
                <h4 className="text-xs font-black text-slate-900 dark:text-white truncate leading-snug">
                  {t.subtitle || (isFav ? 'Seçilmişlərə əlavə olundu!' : isCart ? 'Səbətə əlavə olundu!' : t.title)}
                </h4>
                {t.subtitle && t.title && (
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {t.title}
                  </p>
                )}
              </div>

              {/* Action / Dismiss Button */}
              {isCart ? (
                <button
                  type="button"
                  onClick={() => {
                    removeToast(t.id);
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('techno_open_cart_drawer'));
                    }
                  }}
                  className="bg-[#4f533b] hover:bg-[#3e4230] text-white font-extrabold text-[10px] sm:text-[11px] px-2.5 py-1.5 rounded-xl flex-shrink-0 shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  Səbətə bax
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => removeToast(t.id)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  aria-label="Bağla"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Shrinking progress bar */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 3.5, ease: 'linear' }}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4f533b]/30 dark:bg-emerald-400/30 rounded-b-2xl overflow-hidden"
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
