'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from './HeroIconsHub';

const DEFAULT_SLIDER_IMAGES = [
  {
    id: 'default-1',
    url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1600&q=80',
    alt: 'Promo Banner 1',
    link: ''
  },
  {
    id: 'default-2',
    url: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1600&q=80',
    alt: 'Promo Banner 2',
    link: ''
  },
  {
    id: 'default-3',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80',
    alt: 'Promo Banner 3',
    link: ''
  }
];

export default function BannerImageSlider() {
  const router = useRouter();
  const [slides, setSlides] = useState<Array<{ id: string | number; url: string; alt: string; link?: string }>>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const loadBanners = () => {
    fetch('/api/catalog/banners', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const active = data
            .filter((b: any) => b.active !== false && (b.image || b.image_url))
            .map((b: any) => ({
              id: b.id,
              url: b.image || b.image_url,
              alt: b.title || 'Banner',
              link: b.link || b.link_url || '',
            }));
          if (active.length > 0) {
            setSlides(active);
            try { localStorage.setItem('techno_erp_banners', JSON.stringify(data)); } catch (e) {}
            return;
          }
        }
        fallbackLocal();
      })
      .catch(() => fallbackLocal());
  };

  const fallbackLocal = () => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('techno_erp_banners');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const active = parsed
              .filter((b: any) => b.active !== false && (b.image || b.image_url))
              .map((b: any) => ({
                id: b.id,
                url: b.image || b.image_url,
                alt: b.title || 'Banner',
                link: b.link || b.link_url || '',
              }));
            if (active.length > 0) {
              setSlides(active);
              return;
            }
          }
        }
      } catch (e) {}
    }
    setSlides(DEFAULT_SLIDER_IMAGES);
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

  const totalSlides = slides.length > 0 ? slides.length : DEFAULT_SLIDER_IMAGES.length;
  const activeSlides = slides.length > 0 ? slides : DEFAULT_SLIDER_IMAGES;

  useEffect(() => {
    if (totalSlides <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 4500);
    return () => clearInterval(timer);
  }, [totalSlides]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const handleSlideClick = (slide: { link?: string }) => {
    if (slide.link && slide.link.trim() !== '') {
      if (slide.link.startsWith('http://') || slide.link.startsWith('https://')) {
        window.open(slide.link, '_blank');
      } else {
        router.push(slide.link);
      }
    }
  };

  return (
    <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border-0 bg-transparent group mb-6">
      {/* Pure Image Container */}
      <div className="relative h-44 sm:h-64 md:h-80 w-full overflow-hidden">
        {activeSlides.map((img, idx) => (
          <div
            key={img.id}
            onClick={() => handleSlideClick(img)}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === (currentIndex % totalSlides) ? 'opacity-100 z-10 cursor-pointer' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={img.url}
              alt={img.alt}
              className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-102"
            />
          </div>
        ))}
      </div>

      {/* Slide Navigation Arrows */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/35 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-300 cursor-pointer opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg active:scale-95"
            aria-label="Əvvəlki"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/35 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-300 cursor-pointer opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg active:scale-95"
            aria-label="Növbəti"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          {/* Centered Pagination Indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow-lg">
            {activeSlides.map((_, idx) => {
              const isCurrent = idx === (currentIndex % totalSlides);
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
                    isCurrent
                      ? 'w-7 bg-[#4f533b] border border-amber-300/40 shadow-xs ring-1 ring-white/30'
                      : 'w-2 bg-white/60 hover:bg-white'
                  }`}
                  aria-label={`Slayd ${idx + 1}`}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
