'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShoppingCartIcon as ShoppingCart,
  HeartIcon as Heart,
  ArrowsRightLeftIcon as Scale,
  SparklesIcon as Sparkles,
  CreditCardIcon as CreditCard,
  ArrowTopRightOnSquareIcon as ExternalLink,
  BoltIcon as Zap,
  VideoCameraIcon as Video,
  StarIcon as Star,
  EyeIcon as Eye,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { Button, Chip, Tooltip } from '@heroui/react';
import { Product, getQuickSpecs, toSlug } from '../data/products';
import { calculateProductRatingStats } from '../utils/reviewManager';

interface ProductCardProps {
  product: Product;
  isDarkMode?: boolean;
  isInCart?: boolean;
  isFav?: boolean;
  isCompared?: boolean;
  onToggleCart: (product: Product) => void;
  onToggleFav?: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  onToggleCompare: (productId: string) => void;
  onCreditClick?: (product: Product) => void;
  onSelectProduct?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  isLarge?: boolean;
  priority?: boolean;
}

export default function ProductCard({
  product,
  isDarkMode = false,
  isInCart = false,
  isFav = false,
  isCompared = false,
  onToggleCart,
  onToggleFav,
  onToggleFavorite,
  onToggleCompare,
  onCreditClick,
  onSelectProduct,
  onQuickView,
  isLarge = false,
  priority = false,
}: ProductCardProps) {
  if (!product) return null;

  const [selectedMonths, setSelectedMonths] = useState<number>(12);
  const [activeCardImg, setActiveCardImg] = useState<string>(product?.image || '');
  const [selectedColorIdx, setSelectedColorIdx] = useState<number>(0);
  const [activeCampaignBadge, setActiveCampaignBadge] = useState<{ label: string; imageUrl?: string; discountStr?: string } | null>(null);
  const [activeCustomBadges, setActiveCustomBadges] = useState<Array<{ label: string; colorBg: string }>>([]);
  const quickSpecs = getQuickSpecs(product);

  const loadBadgesAndCampaigns = () => {
    try {
      // 1. Load Active Campaigns
      const savedCmp = localStorage.getItem('technomania_active_campaigns');
      if (savedCmp) {
        const campaigns = JSON.parse(savedCmp);
        if (Array.isArray(campaigns)) {
          const activeCmp = campaigns.find((c: any) => {
            if (c.status !== 'active') return false;
            if (Array.isArray(c.items) && c.items.length > 0) {
              return c.items.some((item: any) => String(item.productId) === String(product.id) || item.productName === product.model_name);
            }
            return true;
          });

          if (activeCmp) {
            const matchedItem = activeCmp.items?.find((item: any) => String(item.productId) === String(product.id) || item.productName === product.model_name);
            const discountPercent = matchedItem?.discountPercent || activeCmp.globalDiscountPercent;

            setActiveCampaignBadge({
              label: typeof activeCmp.badgeLabel === 'string' ? activeCmp.badgeLabel : '',
              imageUrl: activeCmp.imageUrl || '',
              discountStr: (activeCmp.applyDiscount !== false && discountPercent) ? `-${discountPercent}%` : undefined
            });
          } else {
            setActiveCampaignBadge(null);
          }
        }
      }

      // 2. Load Custom ERP Badges
      const savedBdg = localStorage.getItem('technomania_custom_badges');
      if (savedBdg) {
        const badges = JSON.parse(savedBdg);
        if (Array.isArray(badges)) {
          const matchedBadges = badges.filter((b: any) => Array.isArray(b.productIds) && b.productIds.some((pId: string) => String(pId) === String(product.id)));
          setActiveCustomBadges(matchedBadges.map((b: any) => ({ label: b.label, colorBg: b.colorBg || '#4f533b' })));
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadBadgesAndCampaigns();
    window.addEventListener('techno_campaigns_updated', loadBadgesAndCampaigns);
    window.addEventListener('techno_badges_updated', loadBadgesAndCampaigns);
    window.addEventListener('storage', loadBadgesAndCampaigns);
    return () => {
      window.removeEventListener('techno_campaigns_updated', loadBadgesAndCampaigns);
      window.removeEventListener('techno_badges_updated', loadBadgesAndCampaigns);
      window.removeEventListener('storage', loadBadgesAndCampaigns);
    };
  }, [product?.id, product?.model_name]);

  if (!product) return null;

  const cashPriceStr = String(product.cash_price || '');
  const rawNum = product.rawPrice || (cashPriceStr ? parseFloat(cashPriceStr.replace(/[^\d.]/g, '')) : 0) || 1000;
  const calculatedMonthly = Math.round(rawNum / selectedMonths);


  // Real Rating score and real review count computation
  const dynamicRating = calculateProductRatingStats(product.id || product.model_name);
  const realReviewCount = dynamicRating.reviewCount > 0 ? dynamicRating.reviewCount : ((product as any).reviewCount || 0);
  const realRatingAvg = dynamicRating.reviewCount > 0 ? dynamicRating.avgRating.toFixed(1) : ((product as any).rating ? (product as any).rating.toFixed(1) : '5.0');

  const handleFav = (id: string) => {
    if (onToggleFav) onToggleFav(id);
    else if (onToggleFavorite) onToggleFavorite(id);
  };

  const handleCartAdd = (p: Product) => {
    onToggleCart(p);
  };

  const renderCardBody = () => (
    <div className="p-2 sm:p-3 flex flex-col flex-1 justify-between h-full" suppressHydrationWarning>
      <div>
        {/* Top Badges Row — Single line clean alignment */}
        <div className="flex items-center justify-between gap-1 mb-1.5 h-5 sm:h-6 overflow-hidden">
          <div className="flex items-center gap-1 overflow-x-hidden flex-nowrap scrollbar-hide">
            {/* Low Stock Warning Badge (< 10 units) — Solid Red Oval with White Text */}
            {(() => {
              const stockNum = typeof (product as any).stock === 'number'
                ? (product as any).stock
                : (parseInt(String((product as any).stock || 0), 10) || 0);

              if (stockNum > 0 && stockNum < 10) {
                return (
                  <span className="bg-red-600 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 shadow-xs">
                    Son {stockNum} ədəd
                  </span>
                );
              }
              return null;
            })()}

            {/* Custom ERP Badges */}
            {activeCustomBadges.map((bdg, bIdx) => (
              <span
                key={bIdx}
                className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 shadow-xs"
                style={{ backgroundColor: bdg.colorBg, color: '#ffffff' }}
              >
                {bdg.label}
              </span>
            ))}

            {/* Discount Badge — Solid Red Oval with White Text */}
            {(activeCampaignBadge?.discountStr || product.discount || (product as any).discount_percent) && (
              <span className="bg-red-600 text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0 shadow-xs tracking-tight">
                {activeCampaignBadge?.discountStr || product.discount || `-${(product as any).discount_percent}%`}
              </span>
            )}

            {activeCampaignBadge?.label && activeCampaignBadge.label.trim() !== '' && (
              <span className="bg-emerald-600 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 shadow-xs">
                {activeCampaignBadge.label}
              </span>
            )}

            {/* Yeni Badge — Solid Green Oval with White Text */}
            {(() => {
              const isStillNew = (product.isNew || (product as any).is_new) && (!(product as any).new_badge_until || new Date((product as any).new_badge_until).getTime() > Date.now());
              return isStillNew ? (
                <span className="bg-emerald-600 text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0 shadow-xs">
                  Yeni
                </span>
              ) : null;
            })()}

            {((product as any).badge || (product as any).badge_text) &&
             String((product as any).badge || (product as any).badge_text).toLowerCase() !== 'yeni' && (
              <span
                className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 shadow-xs"
                style={{
                  backgroundColor: (product as any).badge_color || '#4f533b',
                  color: '#ffffff',
                }}
              >
                {(product as any).badge || (product as any).badge_text}
              </span>
            )}

            {/* Additional Tags (from ERP product tags array) */}
            {Array.isArray((product as any).tags) && (product as any).tags.map((tag: string, tIdx: number) => (
              <span
                key={tIdx}
                className="bg-[#4f533b] text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 shadow-xs"
              >
                {tag}
              </span>
            ))}

            {(product.isOnlineOnly || (product as any).is_online_only) && (
              <span className="bg-slate-700 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 shadow-xs">
                Onlayn
              </span>
            )}
          </div>

          {/* Real Review Rating & Review Count Badge (Hidden on mobile) */}
          <div className="hidden sm:flex items-center gap-1 text-slate-600 dark:text-slate-300 text-[10px] font-bold flex-shrink-0 ml-auto">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
            <span>{realRatingAvg}</span>
          </div>
        </div>

        {/* Product Image Box Spotlight — Equal Height & Rounded-3xl Oval Frame */}
        <Link
          href={`/product/${toSlug(product.model_name || product.id)}`}
          onClick={(e) => {
            if (onSelectProduct) {
              e.preventDefault();
              onSelectProduct(product);
            }
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          }}
          className="relative w-full h-36 sm:h-48 my-1 flex items-center justify-center p-2.5 cursor-pointer bg-white dark:bg-slate-900 group/img block overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-xs"
        >
          {/* Subtle Oval Ambient Disc */}
          <div className="absolute inset-2 sm:inset-3 rounded-full bg-slate-50/70 dark:bg-slate-800/40 pointer-events-none -z-0 transition-transform duration-300 group-hover/img:scale-105" />

          {activeCardImg || product.image ? (
            <Image
              src={activeCardImg || product.image}
              alt={product.model_name || 'Məhsul'}
              width={250}
              height={250}
              priority={priority}
              className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover/img:scale-105 transition-all duration-300 w-auto h-auto relative z-10"
            />
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs relative z-10">
              Şəkil Yoxdur
            </div>
          )}

          {/* Quick View Eye Button Overlay */}
          {onQuickView && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              className="absolute top-2 right-2 z-30 p-1.5 sm:p-2 rounded-full bg-white/95 dark:bg-slate-800/95 text-slate-700 dark:text-slate-200 hover:text-[#4f533b] hover:scale-110 shadow-md backdrop-blur-xs opacity-0 group-hover/img:opacity-100 transition-all duration-200 cursor-pointer flex items-center gap-1 text-[10px] font-bold"
              title="Tez baxış"
            >
              <Eye className="w-3.5 h-3.5 text-[#4f533b]" />
              <span className="hidden sm:inline">Tez baxış</span>
            </button>
          )}

          {/* Bottom-Left Circular Campaign Badge */}
          {((activeCampaignBadge?.imageUrl && activeCampaignBadge.imageUrl.trim() !== '') || (activeCampaignBadge?.label && activeCampaignBadge.label.trim() !== '')) && (
            <div className="absolute bottom-1.5 left-1.5 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-md shadow-slate-900/30 flex items-center justify-center transform group-hover/img:scale-110 transition-transform select-none">
              {activeCampaignBadge.imageUrl ? (
                <img src={activeCampaignBadge.imageUrl} alt="Campaign Badge" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-[#4f533b] text-white font-black text-[8px] sm:text-[9px] flex items-center justify-center text-center p-0.5 border border-white/20">
                  <span className="leading-tight font-bold text-[8px] sm:text-[9px]">
                    {activeCampaignBadge.label}
                  </span>
                </div>
              )}
            </div>
          )}

          {product.hasVideo && (
            <span className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-md text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 z-20">
              <Video className="w-2.5 h-2.5 text-[#4f533b]" /> Video
            </span>
          )}
        </Link>

        {/* Product Title — Fixed 2-Line Box for strict alignment */}
        <Link
          href={`/product/${toSlug(product.model_name || product.id)}`}
          onClick={(e) => {
            if (onSelectProduct) {
              e.preventDefault();
              onSelectProduct(product);
            }
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          }}
          className={`font-semibold line-clamp-2 text-center flex items-center justify-center leading-tight cursor-pointer hover:text-[#4f533b] transition-colors duration-200 block px-0.5 ${
            isDarkMode ? 'text-[#f8fafc]' : 'text-slate-900'
          } ${isLarge ? 'text-sm sm:text-base h-11 sm:h-12' : 'text-xs sm:text-sm h-10 sm:h-11'}`}
        >
          {product.model_name}
        </Link>
      </div>

      <div>
        {/* Ultra-Clean Modern Animated Credit Selector */}
        <div className="mt-1.5 sm:mt-2">
          <div className="flex items-center justify-between gap-1 text-[10px] sm:text-xs mb-1 px-0.5">
            <span className={`font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Hissəli:</span>
            <span
              key={selectedMonths}
              className="font-black text-[#4f533b] dark:text-[#a3a886] text-xs sm:text-sm whitespace-nowrap animate-scaleUp transition-all inline-block"
            >
              {calculatedMonthly} ₼<span className="text-[9px] sm:text-[10px] font-bold opacity-80">/ay</span>
            </span>
          </div>
          
          {/* Animated 3-Choice Segment Control */}
          <div className={`p-0.5 rounded-xl flex items-center gap-1 ${isDarkMode ? 'bg-slate-800/90' : 'bg-slate-100/90'}`}>
            {[6, 12, 18].map((m) => {
              const isSelected = selectedMonths === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setSelectedMonths(m); }}
                  className={`flex-1 py-1 rounded-lg text-[10px] sm:text-xs font-black transition-all duration-200 cursor-pointer text-center whitespace-nowrap active:scale-95 ${
                    isSelected
                      ? 'bg-[#4f533b] text-white shadow-sm scale-102 ring-1 ring-[#4f533b]/30'
                      : isDarkMode
                      ? 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {m} ay
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Block */}
        <div className="mt-1.5 sm:mt-2 pt-0.5 flex items-baseline justify-center gap-1.5 min-h-[24px] sm:min-h-[28px]">
          {product.old_price && (
            <span className="line-through text-[10px] sm:text-xs font-semibold text-slate-400 whitespace-nowrap">
              {product.old_price}
            </span>
          )}
          <span className={`font-black text-base sm:text-xl md:text-2xl tracking-tight text-[#4f533b] dark:text-[#a3a886] whitespace-nowrap`}>
            {product.cash_price}
          </span>
        </div>

        {/* Cart Action Buttons Row — Pixel Perfect Alignment & Micro-Interactions */}
        <div className="mt-2 sm:mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleFav(product.id);
            }}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border transition-transform duration-150 cursor-pointer flex-shrink-0 active:scale-90 outline-none select-none ${
              isFav
                ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-400 shadow-2xs'
                : isDarkMode
                ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-rose-500 hover:border-rose-400'
                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-400'
            }`}
            title={isFav ? "Seçilmişlərdən çıxar" : "Bəyən"}
            aria-label="Bəyən"
          >
            <Heart className={`w-4 h-4 transition-transform duration-150 ${isFav ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleCompare(product.id);
            }}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border transition-transform duration-150 cursor-pointer flex-shrink-0 active:scale-90 outline-none select-none ${
              isCompared
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-400 shadow-2xs'
                : isDarkMode
                ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-indigo-500 hover:border-indigo-400'
                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-indigo-500 hover:border-indigo-400'
            }`}
            title={isCompared ? "Müqayisədən çıxar" : "Müqayisə et"}
            aria-label="Müqayisə et"
          >
            <Scale className={`w-4 h-4 transition-transform duration-150 ${isCompared ? 'text-indigo-600 dark:text-indigo-400 scale-110' : ''}`} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCartAdd(product);
            }}
            className={`flex-1 font-black text-xs sm:text-sm h-8 sm:h-9 px-2 rounded-xl text-white shadow-sm transition-all duration-200 min-w-0 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer select-none outline-none ${
              isInCart
                ? 'bg-[#3e4230] shadow-2xs ring-1 ring-[#3e4230]/40'
                : 'bg-[#4f533b] hover:bg-[#3e4230] shadow-md shadow-[#4f533b]/20 hover:shadow-lg hover:shadow-[#4f533b]/30'
            }`}
            aria-label="Səbətə at"
          >
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="text-[10px] sm:text-xs whitespace-nowrap truncate font-bold">
              {isInCart ? 'Səbətdədir' : 'Səbətə at'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  const rawSpecs = getQuickSpecs(product);
  const fallbackSpecs = [
    { label: 'Brend', value: product.brand || 'Orijinal' },
    { label: 'Kateqoriya', value: product.category || 'Elektronika' },
    { label: 'Zəmanət', value: '1 il rəsmi' },
    { label: 'Çatdırılma', value: 'Sürətli kuryer' },
  ];
  const displaySpecs = rawSpecs.length > 0 ? rawSpecs.slice(0, 4) : fallbackSpecs;

  return (
    <div className="group relative z-10 hover:z-20 h-full flex flex-col">
      {/* 1. Base Static Card (Maintains rock-solid grid cell height) */}
      <div className={`h-full rounded-2xl border flex flex-col justify-between transition-all duration-300 ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
      }`}>
        {renderCardBody()}
      </div>

      {/* 2. Floating Hover Card with Accordion Slide-Down Extension (Desktop Hover) */}
      <div
        className={`hidden lg:flex absolute top-0 left-0 right-0 z-20 rounded-2xl border flex-col transition-all duration-300 ease-out pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100 group-hover:shadow-[0_22px_55px_rgba(0,0,0,0.18)] dark:group-hover:shadow-[0_22px_55px_rgba(0,0,0,0.6)] group-hover:border-[#4f533b] ${
          isDarkMode
            ? 'bg-slate-900 border-slate-700'
            : 'bg-white border-slate-200'
        }`}
      >
        {renderCardBody()}

        {/* ── Smooth Accordion Slide-Down Extension Drawer ── */}
        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]">
          <div className="overflow-hidden">
            <div className="opacity-0 -translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] delay-50 p-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-2.5 bg-slate-50/70 dark:bg-slate-800/40 rounded-b-2xl">
              {/* Header Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#4f533b] dark:text-[#a3a886]" />
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    Məhsul Təfərrüatları
                  </span>
                </div>
              </div>

              {/* Key Specs List — Stacked Vertically, Max 4 */}
              <div className="flex flex-col gap-1.5">
                {displaySpecs.slice(0, 4).map((spec, i) => (
                  <div key={i} className="flex items-center justify-between bg-white dark:bg-slate-800/90 px-2.5 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700/60 shadow-2xs">
                    <span className="text-[10px] text-slate-400 font-medium truncate">{spec.label}</span>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">{spec.value}</span>
                  </div>
                ))}
              </div>

              {/* Official Warranty Text — Regular, Elegant, Readable */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-normal text-slate-500 dark:text-slate-400 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                <span>1 il rəsmi zəmanət</span>
              </div>

              {/* Color Swatches (if present) */}
              {product.colors && product.colors.length > 0 && (
                <div className="flex items-center justify-between px-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Rəng seçimi:</span>
                  <div className="flex items-center gap-1.5">
                    {(product.colors as any[]).map((c: any, idx: number) => {
                      const colorHex = typeof c === 'string' ? c : c?.hex || '#94a3b8';
                      const colorTitle = typeof c === 'string' ? `Rəng ${idx + 1}` : c?.name || `Rəng ${idx + 1}`;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedColorIdx(idx);
                            const imagesList = (product as any).images;
                            if (Array.isArray(imagesList) && imagesList[idx]) {
                              setActiveCardImg(imagesList[idx]);
                            }
                          }}
                          className={`w-4 h-4 rounded-full border-2 shadow-xs transition-all cursor-pointer ${
                            selectedColorIdx === idx ? 'border-[#4f533b] scale-125 ring-1 ring-[#4f533b]/40' : 'border-white dark:border-slate-800 hover:scale-110'
                          }`}
                          style={{ backgroundColor: colorHex }}
                          title={colorTitle}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onCreditClick?.(product); }}
                  className="py-2.5 px-2 rounded-xl bg-[#4f533b] hover:bg-[#3e4230] text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer active:scale-95"
                >
                  <CreditCard className="w-3.5 h-3.5" /> Kreditlə al
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onSelectProduct?.(product); }}
                  className="py-2.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 border border-slate-200/80 dark:border-slate-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Ətraflı bax
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
