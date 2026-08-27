'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, ArrowRight, Sparkles, X, ChevronRight, Zap } from './HeroIconsHub';
import { getLiveProducts, matchProductSearch, toSlug, Product } from '../data/products';

interface SearchAutocompleteDropdownProps {
  query: string;
  onClose: () => void;
  onSelectProduct?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  isDarkMode?: boolean;
}

export default function SearchAutocompleteDropdown({
  query,
  onClose,
  onSelectProduct,
  onAddToCart,
  isDarkMode = false,
}: SearchAutocompleteDropdownProps) {
  const router = useRouter();
  const [meiliResults, setMeiliResults] = useState<any[]>([]);
  const [totalHits, setTotalHits] = useState<number>(0);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const q = (query || '').trim();
    if (!q || q.length < 1) {
      setMeiliResults([]);
      setTotalHits(0);
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(q)}&limit=6`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.hits)) {
            setMeiliResults(data.hits);
            setTotalHits(data.total || data.hits.length);
            if (data.processingTimeMs !== undefined) {
              setResponseTime(data.processingTimeMs);
            }
            setIsLoading(false);
            return;
          }
        }
      } catch (e) {
        // Fall back to local catalog
      }

      // Fallback
      const catalog = getLiveProducts();
      const localMatches = catalog.filter(p => matchProductSearch(p, q));
      setMeiliResults(localMatches.slice(0, 6));
      setTotalHits(localMatches.length);
      setResponseTime(null);
      setIsLoading(false);
    }, 100);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  if (!query || query.trim().length < 1) return null;

  const handleProductClick = (item: any) => {
    onClose();
    const slug = toSlug(item.model_name || item.name);
    if (onSelectProduct) {
      onSelectProduct(item);
    } else {
      router.push(`/product/${slug}`);
    }
  };

  const handleViewAll = () => {
    onClose();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div
      className={`absolute left-0 right-0 top-full mt-2 z-[99999] rounded-2xl border shadow-2xl overflow-hidden transition-all animate-fadeIn ${
        isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      {/* Header */}
      <div className={`px-4 py-2.5 border-b flex items-center justify-between text-xs font-bold ${
        isDarkMode ? 'bg-slate-800/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-600'
      }`}>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[#4f533b]">
            <Zap className="w-3.5 h-3.5 fill-current text-amber-500" />
            <span>Ani axtarış:</span>
          </div>
          <span><strong className="text-[#4f533b]">{totalHits} məhsul</strong> tapıldı</span>
          {responseTime !== null && (
            <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 px-1.5 py-0.2 rounded-full font-mono">
              {responseTime}ms
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Results List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
        {meiliResults.length > 0 ? (
          meiliResults.map((prod: any) => {
            const displayName = prod._formatted?.model_name || prod._formatted?.name || prod.model_name || prod.name;
            const displayBrand = prod._formatted?.brand || prod.brand;
            const price = prod.cash_price ? `${Number(prod.cash_price).toLocaleString()} ₼` : '';

            return (
              <div
                key={prod.id}
                onClick={() => handleProductClick(prod)}
                className={`p-3 flex items-center gap-3.5 transition cursor-pointer group ${
                  isDarkMode ? 'hover:bg-slate-800/90' : 'hover:bg-[#f4f5f0]/80'
                }`}
              >
                {/* Thumbnail */}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 p-1 border overflow-hidden ${
                  isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
                }`}>
                  {prod.image ? (
                    <img
                      src={prod.image}
                      alt={prod.model_name || prod.name}
                      className="max-h-12 object-contain group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <Sparkles className="w-5 h-5 text-slate-300" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <span
                    className="text-[10px] font-black text-[#4f533b] block leading-none mb-0.5"
                    dangerouslySetInnerHTML={{ __html: displayBrand }}
                  />
                  <h4
                    className="font-bold text-xs sm:text-sm truncate group-hover:text-[#4f533b] transition-colors"
                    dangerouslySetInnerHTML={{ __html: displayName }}
                  />
                  <div className="flex items-center gap-2 mt-1">
                    {prod.old_price && (
                      <span className="line-through text-[11px] text-slate-400 font-medium">
                        {prod.old_price}
                      </span>
                    )}
                    <span className="font-black text-sm text-[#4f533b]">
                      {price || prod.cash_price}
                    </span>
                    {prod.discount && (
                      <span className="text-[9px] font-black bg-rose-500 text-white px-1.5 py-0.5 rounded-full">
                        {prod.discount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {onAddToCart && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(prod);
                      }}
                      className="p-2 rounded-xl bg-[#4f533b] hover:bg-[#3e4230] text-white transition cursor-pointer active:scale-95 shadow-sm"
                      title="Səbətə at"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#4f533b] group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-6 text-center text-xs text-slate-400">
            "{query}" sorğusuna uyğun heç bir məhsul tapılmadı.
          </div>
        )}
      </div>

      {/* Footer view all */}
      {totalHits > 0 && (
        <div className={`p-2.5 border-t text-center ${
          isDarkMode ? 'bg-slate-800/80 border-slate-800' : 'bg-slate-50 border-slate-100'
        }`}>
          <button
            onClick={handleViewAll}
            className="w-full text-xs font-black text-[#4f533b] hover:underline flex items-center justify-center gap-1 py-1 cursor-pointer"
          >
            Bütün {totalHits} məhsula bax <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
