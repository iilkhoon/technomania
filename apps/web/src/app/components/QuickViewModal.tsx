'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  XMarkIcon as X,
  ShoppingCartIcon as ShoppingCart,
  HeartIcon as Heart,
  ArrowsRightLeftIcon as Scale,
  StarIcon as Star,
  SparklesIcon as Sparkles,
  CheckCircleIcon as CheckCircle,
  ArrowTopRightOnSquareIcon as ExternalLink,
  CreditCardIcon as CreditCard,
  ChevronLeftIcon as ChevronLeft,
  ChevronRightIcon as ChevronRight,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { Button } from '@heroui/react';
import { Product, getQuickSpecs, toSlug } from '../data/products';
import { calculateProductRatingStats } from '../utils/reviewManager';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
  isInCart?: boolean;
  isFav?: boolean;
  isCompared?: boolean;
  onToggleCart: (product: Product) => void;
  onToggleFav?: (productId: string) => void;
  onToggleCompare?: (productId: string) => void;
}

export default function QuickViewModal({
  product,
  isOpen,
  onClose,
  isDarkMode = false,
  isInCart = false,
  isFav = false,
  isCompared = false,
  onToggleCart,
  onToggleFav,
  onToggleCompare,
}: QuickViewModalProps) {
  const [selectedMonths, setSelectedMonths] = useState<number>(12);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedStorage, setSelectedStorage] = useState<string>('256 GB');
  const [activeImg, setActiveImg] = useState<string>('');

  useEffect(() => {
    if (product) {
      setActiveImg(product.image || '');
      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0]);
      }
    }
  }, [product]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const handleCartClick = () => {
    onToggleCart(product);
    if (typeof window !== 'undefined' && !isInCart) {
      window.dispatchEvent(new CustomEvent('techno_toast', {
        detail: {
          type: 'cart',
          title: product.model_name,
          subtitle: `${product.cash_price} • Səbətə əlavə olundu!`,
          image: activeImg || product.image,
        }
      }));
    }
  };

  const handleFavClick = () => {
    if (onToggleFav) {
      onToggleFav(product.id);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('techno_toast', {
          detail: {
            type: 'fav',
            title: product.model_name,
            subtitle: isFav ? 'Seçilmişlərdən çıxarıldı' : 'Seçilmişlərə əlavə olundu! ❤️',
            image: activeImg || product.image,
          }
        }));
      }
    }
  };

  const quickSpecs = getQuickSpecs(product);
  const cashPriceStr = String(product.cash_price || '');
  const rawPrice = product.rawPrice || parseFloat(cashPriceStr.replace(/[^\d.]/g, '')) || 1000;
  const calculatedMonthly = Math.round(rawPrice / selectedMonths);
  const ratingStats = calculateProductRatingStats(product.id || product.model_name);

  const imagesList = (product as any).images && Array.isArray((product as any).images) && (product as any).images.length > 0
    ? (product as any).images
    : [product.image].filter(Boolean);

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Glassmorphic Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
      />

      {/* Modal Card */}
      <div
        className={`relative w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden z-10 transition-all duration-300 animate-scaleUp max-h-[90vh] flex flex-col md:flex-row ${
          isDarkMode ? 'bg-slate-900/95 border-slate-800 text-white' : 'bg-white/95 border-slate-200 text-slate-900'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          title="Bağla (ESC)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT COLUMN: Gallery */}
        <div className={`w-full md:w-1/2 p-5 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r ${isDarkMode ? 'border-slate-800 bg-slate-800/40' : 'border-slate-100 bg-slate-50/50'}`}>
          <div className="relative flex items-center justify-center h-64 sm:h-72 p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 group/qimg overflow-hidden">
            {product.discount && (
              <span className="absolute top-3 left-3 bg-[#4f533b] text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md z-10">
                {product.discount}
              </span>
            )}

            {imagesList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const curIdx = imagesList.indexOf(activeImg);
                    const prevIdx = curIdx <= 0 ? imagesList.length - 1 : curIdx - 1;
                    setActiveImg(imagesList[prevIdx]);
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:text-[#4f533b] shadow-md backdrop-blur-md transition-all flex items-center justify-center cursor-pointer opacity-70 group-hover/qimg:opacity-100"
                  title="Əvvəlki"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const curIdx = imagesList.indexOf(activeImg);
                    const nextIdx = curIdx >= imagesList.length - 1 ? 0 : curIdx + 1;
                    setActiveImg(imagesList[nextIdx]);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:text-[#4f533b] shadow-md backdrop-blur-md transition-all flex items-center justify-center cursor-pointer opacity-70 group-hover/qimg:opacity-100"
                  title="Növbəti"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            <img
              src={activeImg || product.image}
              alt={product.model_name}
              className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal relative z-10"
            />
          </div>

          {/* Gallery Thumbnails */}
          {imagesList.length > 1 && (
            <div className="flex items-center gap-2 mt-4 overflow-x-auto p-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
              {imagesList.map((img: string, idx: number) => {
                const isSelected = activeImg === img;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImg(img)}
                    className={`w-13 h-13 rounded-2xl border-2 p-1 transition-all cursor-pointer flex-shrink-0 flex items-center justify-center overflow-hidden ${
                      isSelected
                        ? 'border-[#4f533b] dark:border-[#9ba179] bg-white dark:bg-slate-800 shadow-md shadow-[#4f533b]/20 scale-105 z-10'
                        : isDarkMode
                        ? 'border-slate-800 bg-slate-800 hover:border-slate-600'
                        : 'border-slate-200/90 bg-white hover:border-[#4f533b]/50'
                    }`}
                  >
                    <img src={img} alt={`thumb ${idx + 1}`} className="max-h-full max-w-full object-contain" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Details */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Header / Brand */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-extrabold text-[#4f533b] dark:text-[#a3a886] tracking-wider">
                {product.brand}
              </span>
              <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-md border border-amber-500/20 text-xs font-black">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{ratingStats.avgRating}</span>
              </div>
            </div>

            {/* Product Title */}
            <h2 className="text-lg sm:text-xl font-black leading-snug mb-3">
              {product.model_name}
            </h2>

            {/* Colors Swatches */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-3">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Rəng seçimi:</span>
                <div className="flex items-center gap-2">
                  {(product.colors as any[]).map((c: any, i: number) => {
                    const colorHex = typeof c === 'string' ? c : c?.hex || '#94a3b8';
                    const colorName = typeof c === 'string' ? c : c?.name || `Rəng ${i + 1}`;
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedColor(colorName)}
                        style={{ backgroundColor: colorHex }}
                        title={colorName}
                        className={`w-6 h-6 rounded-full border-2 transition cursor-pointer ${
                          selectedColor === colorName ? 'border-[#4f533b] ring-2 ring-[#4f533b]/40 scale-110' : 'border-white dark:border-slate-700 hover:scale-105'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Specs Grid */}
            {quickSpecs.length > 0 && (
              <div className="space-y-1 mb-4">
                {quickSpecs.slice(0, 3).map((spec, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                    <span className="text-slate-500 dark:text-slate-400 font-semibold">{spec.label}:</span>
                    <span className="font-bold truncate max-w-[140px]">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Installment Calculator */}
            <div className={`p-3 rounded-2xl border mb-4 ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-500 dark:text-slate-400">Hissəli ödəniş:</span>
                <span className="font-black text-[#4f533b] dark:text-[#a3a886] text-sm">
                  {calculatedMonthly} ₼<span className="text-[10px] font-normal">/ay</span>
                </span>
              </div>
              <div className="flex items-center gap-1">
                {[6, 12, 18].map(m => (
                  <button
                    key={m}
                    onClick={() => setSelectedMonths(m)}
                    className={`flex-1 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                      selectedMonths === m ? 'bg-[#4f533b] text-white' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {m} ay
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                onPress={handleCartClick}
                className={`flex-1 py-3 px-4 h-11 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md ${
                  isInCart ? 'bg-[#3e4230] text-white' : 'bg-[#4f533b] hover:bg-[#3e4230] text-white shadow-[#4f533b]/20'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                {isInCart ? 'Səbətdədir ✓' : 'Səbətə at'}
              </Button>

              {onToggleFav && (
                <Button
                  isIconOnly
                  variant={isFav ? "primary" : "outline"}
                  onPress={handleFavClick}
                  className={`p-3 h-11 w-11 rounded-xl transition cursor-pointer ${
                    isFav ? 'border-[#4f533b] text-[#4f533b] bg-slate-100 dark:bg-slate-800' : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-[#4f533b]'
                  }`}
                  aria-label="Bəyən"
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'fill-[#4f533b]' : ''}`} />
                </Button>
              )}
            </div>

            <Link
              href={`/product/${toSlug(product.model_name || product.id)}`}
              onClick={onClose}
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-[#4f533b] font-black text-xs flex items-center justify-center gap-1.5 transition text-center block"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Bütün detallara keç
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
