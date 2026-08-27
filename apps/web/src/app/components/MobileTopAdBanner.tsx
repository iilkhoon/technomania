'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight } from './HeroIconsHub';

export default function MobileTopAdBanner({ isDarkMode = false }: { isDarkMode?: boolean }) {
  const [banners, setBanners] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const router = useRouter();

  const loadBanners = () => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('techno_erp_banners');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const active = parsed.filter((b: any) => b && b.active !== false && (b.image || b.image_url));
            if (active.length > 0) setBanners(active);
          }
        }
      } catch (e) {}
    }

    fetch('/api/catalog/banners', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const active = data.filter((b: any) => b && b.active !== false && (b.image || b.image_url));
          setBanners(active);
          try { localStorage.setItem('techno_erp_banners', JSON.stringify(data)); } catch (e) {}
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadBanners();
    const handleUpdate = () => loadBanners();
    window.addEventListener('techno_banners_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('techno_banners_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [banners.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || banners.length <= 1) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // swipe left -> next
        setCurrentIndex(prev => (prev + 1) % banners.length);
      } else {
        // swipe right -> prev
        setCurrentIndex(prev => (prev === 0 ? banners.length - 1 : prev - 1));
      }
    }
    touchStartXRef.current = null;
  };

  // If we have uploaded hero banner images from ERP/backend
  if (banners.length > 0) {
    return (
      <div className="block lg:hidden mb-3.5 w-full select-none">
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={`relative w-full aspect-[16/9] sm:aspect-[2/1] min-h-[195px] max-h-[260px] rounded-2xl overflow-hidden shadow-sm transition-all duration-300 border-0 ${
            isDarkMode ? 'bg-slate-900' : 'bg-slate-100'
          }`}
        >
          {/* Layered Crossfade Slides matching PC Desktop */}
          <div className="relative w-full h-full overflow-hidden">
            {banners.map((slide, idx) => {
              const isCurrent = idx === (currentIndex % banners.length);
              return (
                <div
                  key={slide.id || idx}
                  onClick={() => {
                    if (slide.link) {
                      if (slide.link.startsWith('http')) window.open(slide.link, '_blank');
                      else router.push(slide.link);
                    }
                  }}
                  className={`absolute inset-0 w-full h-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isCurrent
                      ? 'opacity-100 scale-100 z-10 cursor-pointer pointer-events-auto'
                      : 'opacity-0 scale-102 z-0 pointer-events-none'
                  }`}
                >
                  <img
                    src={slide.image || slide.image_url}
                    alt={slide.title || 'Hero Banner'}
                    className="w-full h-full object-cover rounded-2xl transition-transform duration-700 ease-out"
                  />
                </div>
              );
            })}
          </div>

          {/* Navigation Arrows for Mobile */}
          {banners.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(prev => (prev === 0 ? banners.length - 1 : prev - 1));
                }}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-md"
                aria-label="Əvvəlki banner"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(prev => (prev + 1) % banners.length);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-md"
                aria-label="Növbəti banner"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>

              {/* Indicator Dots matching PC Desktop */}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-sm">
                {banners.map((_, idx) => {
                  const isCurrent = idx === (currentIndex % banners.length);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex(idx);
                      }}
                      className={`h-1.5 rounded-full transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
                        isCurrent
                          ? 'w-5 bg-[#4f533b] border border-amber-300/40 shadow-xs'
                          : 'w-1.5 bg-white/60 hover:bg-white'
                      }`}
                      aria-label={`Slayd ${idx + 1}`}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Fallback to PC hero promotional banner styled for mobile
  return (
    <div className="block lg:hidden mb-3.5 w-full select-none">
      <div
        className={`relative w-full aspect-[16/9] sm:aspect-[2/1] min-h-[195px] rounded-2xl overflow-hidden p-4 sm:p-6 transition-all shadow-xs border-0 flex flex-col justify-between ${
          isDarkMode
            ? 'bg-slate-900 text-white'
            : 'bg-gradient-to-br from-emerald-50/90 via-teal-50/60 to-slate-50 text-slate-900'
        }`}
      >
        <div className="relative z-10 max-w-[65%]">
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#4f533b] bg-[#f4f5f0] border border-[#4f533b]/20 px-2 py-0.5 rounded-full mb-1.5 shadow-2xs">
            <Sparkles className="w-3 h-3 text-[#4f533b]" /> technomania.az
          </span>
          <h2 className="text-base sm:text-xl font-black tracking-tight leading-tight">
            xüsusi yay <br />
            <span className="text-[#4f533b] inline-block mt-0.5">fürsətləri</span>
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium line-clamp-2">
            Bütün smartfon və aksessuarlara 24 ayadək komissiyasız faizsiz taksit!
          </p>
          <div className="mt-2.5">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('products-grid-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-[#4f533b] hover:bg-[#3e4230] text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              İndi al <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="absolute right-1 bottom-1 w-32 sm:w-44 opacity-90 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80"
            alt="Promo Smartphone"
            className="w-full h-auto object-contain drop-shadow-md"
          />
        </div>
      </div>
    </div>
  );
}
