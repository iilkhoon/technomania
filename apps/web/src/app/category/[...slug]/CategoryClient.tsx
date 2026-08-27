'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  toSlug,
  Product,
  getProductAttributes,
  getLiveProducts,
  fetchLiveProducts
} from '../../data/products';
import { translations, Language } from '../../data/translations';
import Header from '../../components/Header';
import MobileNavbar from '../../components/MobileNavbar';
import BannerImageSlider from '../../components/BannerImageSlider';
import DynamicFilterSidebar, { FilterState } from '../../components/DynamicFilterSidebar';
import ProductCard from '../../components/ProductCard';
import Footer from '../../components/Footer';
import {
  Search, ShoppingCart, Heart, Scale, User, Filter,
  RotateCcw, SearchX, ChevronRight, TrendingUp, Sparkles,
  Truck, ArrowRight, Flame, Check, SlidersHorizontal, ChevronDown, Video, Eye,
} from '../../components/HeroIconsHub';

interface CategoryClientProps {
  slugs: string[];
}

export default function CategoryClient({ slugs }: CategoryClientProps) {
  const router = useRouter();

  const mainCategorySlug = slugs[0] || '';
  const brandSlug = slugs[1] || '';

  const formatTitle = (str: string) => {
    if (!str) return '';
    return str.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const categoryName = formatTitle(mainCategorySlug) || 'Məhsullar';
  const brandName = formatTitle(brandSlug);

  const [allLiveProducts, setAllLiveProducts] = useState<Product[]>(getLiveProducts());

  const [filterState, setFilterState] = useState<FilterState>({
    minPrice: 0,
    maxPrice: 10000,
    selectedBrands: brandName ? [brandName] : [],
    selectedSpecs: {},
  });

  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc'>('popular');
  const [cart, setCart] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [comparedProducts, setComparedProducts] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>('AZ');
  const [seoExpanded, setSeoExpanded] = useState(false);

  const t = translations[currentLang] || translations.AZ;

  useEffect(() => {
    fetchLiveProducts().then(prods => {
      if (prods && prods.length > 0) {
        setAllLiveProducts(prods);
      }
    });
    const savedLang = (localStorage.getItem('technomania_lang') as Language) || 'AZ';
    if (savedLang) setCurrentLang(savedLang);
    const savedDark = localStorage.getItem('technomania_dark') === 'true';
    setIsDarkMode(savedDark);
  }, []);

  const handleLangChange = (lang: Language) => {
    setCurrentLang(lang);
    localStorage.setItem('technomania_lang', lang);
  };

  // Base Category Products
  const baseCategoryProducts = allLiveProducts.filter(prod => {
    const cat = (prod.category || '').toLowerCase().trim();
    const catId = ((prod as any).category_id || '').toLowerCase().trim();
    const slugCat = mainCategorySlug.toLowerCase().trim();

    if (!slugCat || slugCat === 'all' || slugCat === 'mehsullar' || slugCat === 'products') return true;

    // Direct Category ID match (e.g. 'cat-1', 'cat-4')
    if (catId && (catId === slugCat || slugCat.includes(catId))) return true;

    // Direct category slug match (e.g. 'smartphones', 'smartfonlar-ve-plansetler')
    const prodCatSlug = toSlug(prod.category || '');
    if (prodCatSlug === slugCat || slugCat.includes(prodCatSlug) || prodCatSlug.includes(slugCat)) return true;

    // Specific category keyword matching (STRICT to category name only, NO brand leakage)
    if (slugCat.includes('smartfon') || slugCat.includes('smartphone') || slugCat.includes('mobile') || slugCat.includes('planset')) {
      return cat.includes('smartfon') || cat.includes('planşet') || cat.includes('mobile') || cat.includes('phone');
    }
    if (slugCat.includes('noutbuk') || slugCat.includes('laptop') || slugCat.includes('pc') || slugCat.includes('komputer') || slugCat.includes('kompüter')) {
      return cat.includes('noutbuk') || cat.includes('kompüter') || cat.includes('laptop') || cat.includes('pc');
    }
    if (slugCat.includes('serinlik') || slugCat.includes('sərinlik')) {
      return cat.includes('sərinlik') || cat.includes('serinlik');
    }
    if (slugCat.includes('gunes') || slugCat.includes('günəş')) {
      return cat.includes('günəş') || cat.includes('gunes');
    }
    if (slugCat.includes('aktiv') || slugCat.includes('saglam') || slugCat.includes('sağlam')) {
      return cat.includes('aktiv') || cat.includes('sağlam');
    }
    if (slugCat.includes('oyun') || slugCat.includes('gaming') || slugCat.includes('gamer') || slugCat.includes('console')) {
      return cat.includes('oyun') || cat.includes('gaming') || cat.includes('konsol');
    }
    if (slugCat.includes('tv') || slugCat.includes('televizor') || slugCat.includes('audio')) {
      return cat.includes('tv') || cat.includes('televizor') || cat.includes('audio') || cat.includes('soundbar');
    }
    if (slugCat.includes('boyuk') || slugCat.includes('böyük') || slugCat.includes('big')) {
      return cat.includes('böyük') || cat.includes('boyuk') || cat.includes('soyuducu') || cat.includes('paltaryuyan');
    }
    if (slugCat.includes('kicik') || slugCat.includes('kiçik') || slugCat.includes('small')) {
      return cat.includes('kiçik') || cat.includes('kicik') || cat.includes('qəhvə') || cat.includes('aeroqril');
    }
    if (slugCat.includes('iqlim') || slugCat.includes('climate')) {
      return cat.includes('iqlim') || cat.includes('climate');
    }
    if (slugCat.includes('gozellik') || slugCat.includes('gözəllik') || slugCat.includes('beauty')) {
      return cat.includes('gözəllik') || cat.includes('baxım');
    }
    if (slugCat.includes('avto') || slugCat.includes('auto') || slugCat.includes('moto')) {
      return cat.includes('avto') || cat.includes('auto') || cat.includes('moto');
    }
    if (slugCat.includes('tibbi') || slugCat.includes('medical')) {
      return cat.includes('tibbi') || cat.includes('medical');
    }
    if (slugCat.includes('ev-ve-bag') || slugCat.includes('home-garden') || slugCat.includes('garden')) {
      return cat.includes('ev və bağ') || cat.includes('bağ') || cat.includes('garden');
    }
    if (slugCat.includes('mebel') || slugCat.includes('furniture')) {
      return cat.includes('mebel') || cat.includes('furniture');
    }

    return false;
  });

  // Filtered Products
  let filtered = baseCategoryProducts.filter(prod => {
    // Brand match
    if (filterState.selectedBrands.length > 0) {
      const matchBrand = filterState.selectedBrands.some(b => String(prod?.brand || '').toLowerCase() === String(b || '').toLowerCase());
      if (!matchBrand) return false;
    }

    // Specs match
    const attrs = getProductAttributes(prod);
    for (const [groupTitle, selectedVals] of Object.entries(filterState.selectedSpecs)) {
      if (selectedVals.length > 0) {
        const prodVal = attrs[groupTitle];
        if (!prodVal || !selectedVals.includes(prodVal)) {
          return false;
        }
      }
    }

    // Price match
    const price = prod.rawPrice || parseFloat(prod.cash_price.replace(/[^\d.]/g, '')) || 0;
    if (filterState.minPrice > 0 && price < filterState.minPrice) return false;
    if (filterState.maxPrice < 10000 && price > filterState.maxPrice) return false;

    return true;
  });

  // Sort logic
  if (sortBy === 'price-asc') {
    filtered = [...filtered].sort((a, b) => (a.rawPrice || 0) - (b.rawPrice || 0));
  } else if (sortBy === 'price-desc') {
    filtered = [...filtered].sort((a, b) => (b.rawPrice || 0) - (a.rawPrice || 0));
  }

  const resetFilters = () => {
    setFilterState({
      minPrice: 0,
      maxPrice: 10000,
      selectedBrands: [],
      selectedSpecs: {},
    });
    setSortBy('popular');
  };

  const removeBrandBadge = (bName: string) => {
    setFilterState(prev => ({
      ...prev,
      selectedBrands: prev.selectedBrands.filter(b => b !== bName),
    }));
  };

  const removeSpecBadge = (group: string, val: string) => {
    setFilterState(prev => {
      const groupVals = prev.selectedSpecs[group] || [];
      return {
        ...prev,
        selectedSpecs: {
          ...prev.selectedSpecs,
          [group]: groupVals.filter(v => v !== val),
        },
      };
    });
  };

  useEffect(() => {
    const savedCart = localStorage.getItem('technomania_cart');
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) {}
    }
    const savedFavs = localStorage.getItem('technomania_favorites');
    if (savedFavs) {
      try { setFavorites(JSON.parse(savedFavs)); } catch (e) {}
    }
    const savedCompare = localStorage.getItem('technomania_compare');
    if (savedCompare) {
      try { setComparedProducts(JSON.parse(savedCompare)); } catch (e) {}
    }
  }, []);

  const toggleCart = (prod: Product) => {
    setCart(prev => {
      const updated = prev.find(p => p.id === prod.id) ? prev.filter(p => p.id !== prod.id) : [...prev, prod];
      localStorage.setItem('technomania_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('technomania_favorites', JSON.stringify(next));
      window.dispatchEvent(new Event('storage'));
      return next;
    });
  };

  const toggleCompare = (id: string) => {
    setComparedProducts(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('technomania_compare', JSON.stringify(next));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('techno_compare_updated'));
      return next;
    });
  };

  const hasActiveFilters =
    filterState.selectedBrands.length > 0 ||
    filterState.minPrice > 0 ||
    filterState.maxPrice < 10000 ||
    Object.values(filterState.selectedSpecs).some(arr => arr.length > 0);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100 dark' : 'bg-[#f8fafc] text-slate-900'} flex flex-col`}>
      <Header
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        currentLang={currentLang}
        setCurrentLang={handleLangChange}
      />

      {/* Main Container */}
      <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex-1">
        
        {/* Breadcrumbs (Kontakt.az style) */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs text-slate-400 mb-3 font-semibold">
          <Link href="/" className="hover:text-[#4f533b] transition">Əsas səhifə</Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <Link href={`/category/${mainCategorySlug}`} className="hover:text-[#4f533b] transition">{categoryName}</Link>
          {brandName && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="text-[#4f533b] font-bold">{brandName}</span>
            </>
          )}
        </div>

        {/* Pure Image Banner Slider (NO text overlay!) */}
        <BannerImageSlider />

        {/* Category Header Bar + Sort Dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {brandName ? `${brandName} ${categoryName}` : categoryName}
            </h1>
            <span className="text-xs font-bold text-slate-400">({filtered.length})</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={`text-xs font-black px-4 py-2 rounded-xl border outline-none cursor-pointer transition ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
              }`}
            >
              <option value="popular">⇅ Çeşidləmə</option>
              <option value="price-asc">Qiymətə görə (ucuzdan bahaya)</option>
              <option value="price-desc">Qiymətə görə (bahadan ucuza)</option>
            </select>
          </div>
        </div>

        {/* Active Filter Badges Bar */}
        {hasActiveFilters && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              onClick={resetFilters}
              className="text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3.5 py-1.5 rounded-full hover:bg-slate-300 transition cursor-pointer flex items-center gap-1.5"
            >
              Seçilənləri sil
            </button>

            {filterState.selectedBrands.map(b => (
              <span
                key={b}
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 shadow-2xs"
              >
                Brend: {b}
                <button onClick={() => removeBrandBadge(b)} className="hover:text-[#4f533b] cursor-pointer text-slate-400">✕</button>
              </span>
            ))}

            {Object.entries(filterState.selectedSpecs).map(([group, vals]) =>
              vals.map(v => (
                <span
                  key={`${group}-${v}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 shadow-2xs"
                >
                  {group}: {v}
                  <button onClick={() => removeSpecBadge(group, v)} className="hover:text-[#4f533b] cursor-pointer text-slate-400">✕</button>
                </span>
              ))
            )}
          </div>
        )}

        {/* Grid Layout: Left Dynamic Filter Sidebar + Right Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Left Dynamic Filter Sidebar */}
          <div className="lg:col-span-3">
            <DynamicFilterSidebar
              products={baseCategoryProducts}
              filteredCount={filtered.length}
              categorySlug={mainCategorySlug}
              categoryName={categoryName}
              filterState={filterState}
              onFilterChange={setFilterState}
              onReset={resetFilters}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Right Product Cards Grid — Unified <ProductCard /> Component! */}
          <div className="lg:col-span-9">
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3.5 lg:gap-4 items-stretch">
                {filtered.map((prod, idx) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    priority={idx < 4}
                    onToggleFavorite={toggleFavorite}
                    onToggleCart={toggleCart}
                    onToggleCompare={toggleCompare}
                    onSelectProduct={(p) => router.push(`/product/${toSlug(p.model_name)}`)}
                    isFav={favorites.includes(prod.id)}
                    isInCart={!!cart.find(c => c.id === prod.id)}
                    isCompared={comparedProducts.includes(prod.id)}
                    isDarkMode={isDarkMode}
                  />
                ))}
              </div>
            ) : (
              /* EMPTY STATE */
              <div className="py-20 px-6 text-center rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-sm">
                <div className="w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-950/80 text-[#4f533b] flex items-center justify-center mx-auto mb-4 border border-[#4f533b]/20 shadow-inner">
                  <SearchX className="w-10 h-10" />
                </div>
                <h3 className="font-black text-xl sm:text-2xl text-slate-900 dark:text-white mb-2 tracking-tight">
                  Axtarışa uyğun nəticə tapılmadı!
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6 font-medium leading-relaxed">
                  Seçilmiş <strong className="text-slate-700 dark:text-slate-200">"{categoryName}"</strong> filtrlərinə uyğun heç bir məhsul tapılmadı. Filtrləri sıfırlayın və ya başqa parametr seçin.
                </p>
                <button
                  onClick={resetFilters}
                  className="bg-[#4f533b] hover:bg-[#3e4230] text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-[#4f533b]/25 transition cursor-pointer inline-flex items-center gap-2 active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" /> Filtrləri sıfırla və bütün məhsullara bax
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Rich SEO Content Accordion */}
        <div className="mt-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white mb-3">
            {categoryName}: sevdiyin keyfiyyət və zəmanət artıq evində
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Müasir texnologiyalar və məişət cihazları üzrə rəsmi zəmanətli məhsulları 24 ayadək hissə-hissə faizsiz taksitlə əldə edin. Bakı və bütün regionlar üzrə çatdırılma xidməti aktivdir.
          </p>

          {seoExpanded && (
            <div className="mt-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed space-y-2 animate-fadeIn">
              <p>
                Rəsmi zəmanət müddəti, faizsiz taksit kartları (Birbank, Tamkart, Bolkart), Bakı və regionlara sürətli pulsuz çatdırılma xidməti ilə alış-verişinizi rahatlıqla tamamlayın.
              </p>
            </div>
          )}

          <div className="mt-4 text-center">
            <button
              onClick={() => setSeoExpanded(!seoExpanded)}
              className="text-xs font-black text-slate-500 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 px-6 py-2 rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>{seoExpanded ? 'Qatla' : 'Hamısını göstər'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${seoExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

      </main>

      {/* Footer */}
      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}
