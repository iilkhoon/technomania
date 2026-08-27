'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu, X, Search, ShoppingCart, Heart, Scale, User,
  Globe, Sun, Moon, ChevronRight, PhoneCall, MapPin,
  Sparkles, Grid,
} from './HeroIconsHub';
import { translations, Language } from '../data/translations';
import CatalogModal from './CatalogModal';
import SearchAutocompleteDropdown from './SearchAutocompleteDropdown';

interface MobileNavbarProps {
  currentPage?: 'home' | 'compare' | 'wishlist' | 'cart' | 'login' | 'register' | 'product';
  searchQuery?: string;
  onSearchChange?: (v: string) => void;
  onSelectCategory?: (categoryName: string) => void;
  comparedCount?: number;
  favoritesCount?: number;
  cartCount?: number;
  isDarkMode: boolean;
  setIsDarkMode: (v: boolean) => void;
  currentLang: Language;
  setCurrentLang: (lang: Language) => void;
}

export default function MobileNavbar({
  currentPage = 'home',
  searchQuery = '',
  onSearchChange,
  onSelectCategory,
  comparedCount = 0,
  favoritesCount = 0,
  cartCount = 0,
  isDarkMode,
  setIsDarkMode,
  currentLang,
  setCurrentLang,
}: MobileNavbarProps) {
  const router = useRouter();
  const t = translations[currentLang] || translations.AZ;
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);
  const searchContainerRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handleClose = (e: Event) => {
      if (e.type === 'mousedown' || e.type === 'touchstart') {
        const target = (e as MouseEvent | TouchEvent).target as Node;
        if (searchContainerRef.current && searchContainerRef.current.contains(target)) {
          return;
        }
      }
      setLocalQuery((prev) => (prev ? '' : prev));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLocalQuery('');
      }
    };

    document.addEventListener('mousedown', handleClose);
    document.addEventListener('touchstart', handleClose, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClose);
      document.removeEventListener('touchstart', handleClose);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(localQuery.trim())}`);
    }
  };

  const go = (path: string) => {
    setMenuOpen(false);
    router.push(path);
  };

  const handleLang = (lang: Language) => {
    setCurrentLang(lang);
    localStorage.setItem('technomania_lang', lang);
  };

  const handleDark = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem('technomania_dark', String(next));
  };

  const dark = isDarkMode;

  const navItems = [
    { icon: Scale, label: t.compare, path: '/compare', badge: comparedCount },
    { icon: Heart, label: t.wishlist, path: '/wishlist', badge: favoritesCount },
    { icon: ShoppingCart, label: t.cart, path: '/cart', badge: cartCount },
    { icon: User, label: t.login, path: '/login', badge: 0 },
  ];

  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('technomania_site_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.logoUrl || parsed.erpLogoUrl) setLogoUrl(parsed.logoUrl || parsed.erpLogoUrl);
      }
    } catch (e) {}
  }, []);

  return (
    <>
      {/* TOP ANNOUNCEMENT */}
      <div className="bg-[#4f533b] text-white text-xs sm:text-sm font-black py-2.5 px-4 text-center flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-stone-200 flex-shrink-0" />
        <span className="truncate">{t.announcement}</span>
      </div>

      {/* DESKTOP TOP SUB-BAR */}
      <div className={`border-b text-xs sm:text-sm font-black py-2 hidden md:block transition-colors ${dark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-100 text-slate-700'}`}>
        <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <a href="#" className="text-[#4f533b] font-black hover:underline">{t.campaigns}</a>
            <a href="#" className="hover:text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#4f533b]" /> {t.stores}
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a href="tel:*6060" className="flex items-center gap-1.5 text-[#4f533b] font-black text-sm">
              <PhoneCall className="w-4 h-4 text-[#4f533b]" /> *6060
            </a>
            <div className="flex items-center gap-1">
              <Globe className="w-4 h-4 text-slate-400" />
              <select value={currentLang} onChange={e => handleLang(e.target.value as Language)} className="bg-transparent outline-none cursor-pointer font-black text-xs sm:text-sm">
                <option value="AZ">AZ — Azərbaycan</option>
                <option value="EN">EN — English</option>
                <option value="RU">RU — Русский</option>
              </select>
            </div>
            <button onClick={handleDark} className={`p-1.5 px-3 rounded-lg border flex items-center gap-1.5 text-xs font-black cursor-pointer ${dark ? 'bg-slate-800 border-slate-700 text-amber-300' : 'bg-slate-100 border-slate-200 text-slate-800'}`}>
              {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              {dark ? t.lightTheme : t.darkTheme}
            </button>
          </div>
        </div>
      </div>

      {/* STICKY MAIN HEADER */}
      <header className={`border-b sticky top-0 z-50 shadow-xs relative transition-colors backdrop-blur-md ${dark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200/80'}`}>
        <div className="w-full px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-2">

          {/* Left Group: Mobile burger + Logo */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden flex items-center justify-center w-9 h-9 rounded-xl transition cursor-pointer flex-shrink-0 active:scale-95 ${dark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              aria-label="Menyu"
            >
              {menuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
            </button>

            <button onClick={() => go('/')} className="flex items-center flex-shrink-0 cursor-pointer select-none">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-7 sm:h-9 object-contain" />
              ) : (
                <span className="font-black text-lg tracking-tight text-[#4f533b]">technomania</span>
              )}
            </button>
          </div>

          {/* Desktop: search bar */}
          <div className="hidden md:flex flex-1 items-center gap-2 mx-2">
            <button
              id="catalog-toggle-button"
              data-catalog-toggle="true"
              onClick={() => setCatalogModalOpen(prev => !prev)}
              className="bg-[#4f533b] hover:bg-[#3e4230] text-white font-black px-5 py-3 rounded-xl flex items-center gap-2 text-base transition shadow-md flex-shrink-0 cursor-pointer"
            >
              {catalogModalOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />} {t.catalog}
            </button>
            <form ref={searchContainerRef} onSubmit={handleSearchSubmit} className="relative flex-1">
              <input
                type="text"
                value={localQuery}
                onChange={e => setLocalQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className={`w-full border border-transparent focus:border-[#4f533b] rounded-xl pl-4 pr-12 py-3 text-base font-semibold outline-none transition placeholder:text-slate-400 ${dark ? 'bg-slate-800 text-white' : 'bg-[#f1f5f9] text-slate-900'}`}
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 bg-[#4f533b] text-white rounded-lg px-3.5 flex items-center justify-center cursor-pointer"
              >
                <Search className="w-4.5 h-4.5" />
              </button>

              <SearchAutocompleteDropdown
                query={localQuery}
                onClose={() => setLocalQuery('')}
                isDarkMode={dark}
              />
            </form>
          </div>

          {/* Desktop user icons */}
          <div className="hidden md:flex items-center gap-4 sm:gap-6 flex-shrink-0">
            {navItems.map(({ icon: Icon, label, path, badge }) => (
              <button
                key={path}
                onClick={() => go(path)}
                className={`flex flex-col items-center gap-1 transition relative cursor-pointer ${currentPage === path.slice(1) ? 'text-[#4f533b]' : dark ? 'text-slate-300 hover:text-[#4f533b]' : 'text-slate-600 hover:text-[#4f533b]'}`}
              >
                <Icon className="w-5.5 h-5.5" />
                <span className="text-xs font-bold">{label}</span>
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#4f533b] text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center">{badge}</span>
                )}
              </button>
            ))}
          </div>

          {/* Right Group Mobile: search + wishlist + cart + user */}
          <div className="md:hidden flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`flex items-center justify-center w-9 h-9 rounded-xl transition cursor-pointer active:scale-95 ${
                searchOpen
                  ? 'bg-[#4f533b] text-white shadow-xs'
                  : dark
                  ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              aria-label="Axtarış"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => go('/wishlist')}
              className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition cursor-pointer active:scale-95 ${dark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              aria-label="Seçilmişlər"
            >
              <Heart className={`w-4 h-4 ${favoritesCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {favoritesCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('techno_open_cart_drawer')); }}
              className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition cursor-pointer active:scale-95 ${
                cartCount > 0
                  ? 'bg-[#4f533b] text-white shadow-xs'
                  : dark
                  ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              aria-label="Səbət"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => go('/login')}
              className={`flex items-center justify-center w-9 h-9 rounded-xl transition cursor-pointer active:scale-95 ${dark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              aria-label="Profil"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile inline search */}
        {searchOpen && (
          <div className={`md:hidden px-3 pb-3 pt-1 border-t ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="relative">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={e => onSearchChange?.(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchQuery.trim() && router.push(`/search?q=${encodeURIComponent(searchQuery)}`)}
                placeholder={t.searchPlaceholder}
                className={`w-full border focus:border-[#4f533b] rounded-xl pl-4 pr-11 py-2.5 text-sm outline-none transition placeholder:text-slate-400 ${dark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-[#f1f5f9] border-slate-200 text-slate-900'}`}
              />
              <button
                onClick={() => searchQuery.trim() && router.push(`/search?q=${encodeURIComponent(searchQuery)}`)}
                className="absolute right-1 top-1 bottom-1 bg-[#4f533b] text-white rounded-lg px-3 flex items-center justify-center cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>

              <SearchAutocompleteDropdown
                query={searchQuery}
                onClose={() => onSearchChange?.('')}
                isDarkMode={dark}
              />
            </div>
          </div>
        )}
      </header>

      {/* MOBILE DRAWER */}
      {menuOpen && (
        <div className="fixed inset-0 z-[999] md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className={`absolute left-0 top-0 h-full w-[85vw] max-w-[320px] flex flex-col shadow-2xl ${dark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}`}>

            {/* Drawer header */}
            <div className="bg-gradient-to-r from-[#4f533b] to-[#3e4230] px-5 py-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl tracking-tighter text-white">techno</span>
                <span className="font-black text-2xl tracking-tighter text-amber-300">mania</span>
              </div>
              <button onClick={() => setMenuOpen(false)} className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white cursor-pointer hover:bg-white/25 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Settings: lang + dark */}
            <div className={`flex items-center justify-between px-5 py-3 border-b ${dark ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className="flex items-center gap-2 text-xs font-bold">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={currentLang}
                  onChange={e => handleLang(e.target.value as Language)}
                  className={`bg-transparent outline-none cursor-pointer font-bold text-xs ${dark ? 'text-slate-200' : 'text-slate-700'}`}
                >
                  <option value="AZ">AZ — Azərbaycan</option>
                  <option value="EN">EN — English</option>
                  <option value="RU">RU — Русский</option>
                </select>
              </div>
              <button onClick={handleDark} className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border cursor-pointer ${dark ? 'bg-slate-800 border-slate-700 text-amber-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
                {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                {dark ? t.lightTheme : t.darkTheme}
              </button>
            </div>

            {/* Main nav */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
              {/* Kataloq Button in Drawer */}
              <button
                onClick={() => { setMenuOpen(false); setCatalogModalOpen(true); }}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl mb-2 bg-[#4f533b] text-white font-black shadow-lg shadow-[#4f533b]/20 transition cursor-pointer text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Grid className="w-5 h-5 text-white" />
                </div>
                <span className="font-black text-sm">{t.catalog}</span>
                <ChevronRight className="w-4 h-4 ml-auto text-white/70" />
              </button>

              {navItems.map(({ icon: Icon, label, path, badge }) => (
                <button
                  key={path}
                  onClick={() => go(path)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl mb-1.5 transition cursor-pointer ${dark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}`}
                >
                  <div className="relative flex-shrink-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <Icon className="w-5 h-5 text-[#4f533b]" />
                    </div>
                    {badge > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#4f533b] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{badge}</span>
                    )}
                  </div>
                  <span className="font-bold text-sm">{label}</span>
                  <ChevronRight className="w-4 h-4 ml-auto text-slate-400" />
                </button>
              ))}

              <div className={`my-3 h-px ${dark ? 'bg-slate-800' : 'bg-slate-100'}`} />
              <p className={`px-4 text-[10px] font-extrabold tracking-widest mb-2 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                {currentLang === 'RU' ? 'Ссылки' : currentLang === 'EN' ? 'Links' : 'Keçidlər'}
              </p>
              {[
                { label: t.campaigns, href: '#' },
                { label: t.stores, href: '#' },
                { label: t.contact, href: 'tel:*6060' },
              ].map(({ label, href }) => (
                <a key={label} href={href} onClick={() => setMenuOpen(false)} className={`flex items-center px-4 py-3 rounded-xl mb-1 text-sm font-semibold transition ${dark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-50 text-slate-600'}`}>
                  {label}
                </a>
              ))}
            </nav>

            {/* Footer CTA */}
            <div className={`px-5 py-4 border-t ${dark ? 'border-slate-800' : 'border-slate-100'}`}>
              <button
                onClick={() => go('/login')}
                className="w-full bg-[#4f533b] hover:bg-[#3e4230] text-white font-black py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#4f533b]/25 transition cursor-pointer text-sm"
              >
                <User className="w-4 h-4" /> {t.login}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Catalog Mega Menu Modal */}
      <CatalogModal
        isOpen={catalogModalOpen}
        onClose={() => setCatalogModalOpen(false)}
        onSelectCategory={onSelectCategory}
        isDarkMode={dark}
      />
    </>
  );
}
