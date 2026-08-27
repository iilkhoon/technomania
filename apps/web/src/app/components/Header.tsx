'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bars3Icon as Menu,
  XMarkIcon as X,
  MagnifyingGlassIcon as Search,
  ShoppingCartIcon as ShoppingCart,
  HeartIcon as Heart,
  ArrowsRightLeftIcon as Scale,
  UserIcon as User,
  SunIcon as Sun,
  MoonIcon as Moon,
  PhoneIcon as PhoneCall,
  ClockIcon as Clock,
  SparklesIcon as Sparkles,
  MapPinIcon as MapPin,
  ChevronDownIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { translations, Language } from '../data/translations';
import { toSlug, Product } from '../data/products';
import { Button } from '@heroui/react';
import CatalogModal from './CatalogModal';
import SearchAutocompleteDropdown from './SearchAutocompleteDropdown';

interface HeaderProps {
  isDarkMode?: boolean;
  setIsDarkMode?: (val: boolean) => void;
  currentLang?: Language;
  setCurrentLang?: (lang: Language) => void;
}

const FlagAZ = () => (
  <svg viewBox="0 0 600 300" className="w-4 h-3 rounded-[2px] shadow-xs inline-block flex-shrink-0 object-cover border border-black/10" aria-hidden="true">
    <rect width="600" height="100" fill="#00b5e2"/>
    <rect y="100" width="600" height="100" fill="#ef3340"/>
    <rect y="200" width="600" height="100" fill="#509e2f"/>
    <circle cx="300" cy="150" r="30" fill="#ffffff"/>
    <circle cx="308" cy="150" r="24" fill="#ef3340"/>
    <polygon points="325,150 318,145 320,137 314,142 308,138 311,146 305,150 311,154 308,162 314,158 320,163 318,155" fill="#ffffff"/>
  </svg>
);

const FlagGB = () => (
  <svg viewBox="0 0 60 30" className="w-4 h-3 rounded-[2px] shadow-xs inline-block flex-shrink-0 object-cover border border-black/10" aria-hidden="true">
    <clipPath id="hdr-flag-gb-s"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
    <clipPath id="hdr-flag-gb-t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
    <g clipPath="url(#hdr-flag-gb-s)">
      <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#hdr-flag-gb-t)" stroke="#C8102E" strokeWidth="4"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
    </g>
  </svg>
);

const FlagRU = () => (
  <svg viewBox="0 0 900 600" className="w-4 h-3 rounded-[2px] shadow-xs inline-block flex-shrink-0 object-cover border border-black/10" aria-hidden="true">
    <rect width="900" height="200" fill="#ffffff"/>
    <rect y="200" width="900" height="200" fill="#0039a6"/>
    <rect y="400" width="900" height="200" fill="#d52b1e"/>
  </svg>
);

const renderFlag = (code: Language) => {
  switch (code) {
    case 'AZ': return <FlagAZ />;
    case 'EN': return <FlagGB />;
    case 'RU': return <FlagRU />;
    default: return <FlagAZ />;
  }
};

const LANGUAGES: { code: Language; name: string }[] = [
  { code: 'AZ', name: 'Azərbaycan' },
  { code: 'EN', name: 'English' },
  { code: 'RU', name: 'Русский' },
];

export default function Header({
  isDarkMode: externalDarkMode,
  setIsDarkMode: externalSetIsDarkMode,
  currentLang: externalLang,
  setCurrentLang: externalSetCurrentLang,
}: HeaderProps) {
  const router = useRouter();

  const [internalDarkMode, setInternalDarkMode] = useState(false);
  const [internalLang, setInternalLang] = useState<Language>('AZ');

  const isDarkMode = externalDarkMode !== undefined ? externalDarkMode : internalDarkMode;
  const setIsDarkMode = externalSetIsDarkMode || setInternalDarkMode;

  const currentLang = externalLang || internalLang;
  const setCurrentLang = externalSetCurrentLang || setInternalLang;

  const [searchQuery, setSearchQuery] = useState('');
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const langDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const [cartCount, setCartCount] = useState(0);
  const [favCount, setFavCount] = useState(0);
  const [compareCount, setCompareCount] = useState(0);
  const [customerUser, setCustomerUser] = useState<any>(null);

  const [isMounted, setIsMounted] = useState(false);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('technomania_site_settings');
        if (saved) return true;
      } catch (e) {}
    }
    return false;
  });
  const [siteSettings, setSiteSettings] = useState<{
    logos?: string[];
    logoUrl?: string;
    logoUrl2?: string;
    logoUrl3?: string;
    logo1Height?: number;
    logo2Height?: number;
    logo3Height?: number;
    logoHeight?: number;
    logoGap?: number;
    erpLogoUrl?: string;
    logoTextPrimary?: string;
    logoTextAccent?: string;
    tagline?: string;
    primaryColor?: string;
    faviconUrl?: string;
    tabTitle?: string;
    tabSlogan?: string;
  }>(() => {
    if (typeof window !== 'undefined') {
      if ((window as any).__SERVER_SITE_SETTINGS__ && Object.keys((window as any).__SERVER_SITE_SETTINGS__).length > 0) {
        return (window as any).__SERVER_SITE_SETTINGS__;
      }
      if ((window as any).__CACHED_LOGO_URL__) {
        try {
          const saved = localStorage.getItem('technomania_site_settings');
          if (saved) return JSON.parse(saved);
        } catch (e) {}
        return { logoUrl: (window as any).__CACHED_LOGO_URL__ };
      }
      try {
        const saved = localStorage.getItem('technomania_site_settings');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return {};
  });

  const searchContainerRef = useRef<HTMLFormElement>(null);
  const t = translations[currentLang] || translations.AZ;

  const availableLogos = useMemo(() => {
    if (Array.isArray(siteSettings.logos) && siteSettings.logos.length > 0) {
      return siteSettings.logos.filter(Boolean);
    }
    const list = [siteSettings.logoUrl, (siteSettings as any).logoUrl2, (siteSettings as any).logoUrl3].filter(Boolean) as string[];
    if (list.length > 0) return list;
    if (siteSettings.erpLogoUrl) return [siteSettings.erpLogoUrl];
    return [];
  }, [siteSettings]);

  useEffect(() => {
    setIsMounted(true);
    const loadSiteSettings = () => {
      fetch('/api/catalog/settings', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
        .then(r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then(parsed => {
          setIsSettingsLoaded(true);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && !parsed.statusCode && Object.keys(parsed).length > 0) {
            setSiteSettings(parsed);
            try { localStorage.setItem('technomania_site_settings', JSON.stringify(parsed)); } catch (e) {}
            if (parsed.tabTitle) {
              document.title = parsed.tabSlogan ? `${parsed.tabTitle} | ${parsed.tabSlogan}` : parsed.tabTitle;
            }
            if (parsed.faviconUrl) {
              let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
              if (!link) {
                link = document.createElement('link');
                link.type = 'image/x-icon';
                link.rel = 'shortcut icon';
                document.getElementsByTagName('head')[0].appendChild(link);
              }
              link.href = parsed.faviconUrl;
            }
          }
        })
        .catch(() => {
          setIsSettingsLoaded(true);
          try {
            const saved = localStorage.getItem('technomania_site_settings');
            if (saved) {
              const parsed = JSON.parse(saved);
              setSiteSettings(parsed);
              if (parsed.tabTitle) {
                document.title = parsed.tabSlogan ? `${parsed.tabTitle} | ${parsed.tabSlogan}` : parsed.tabTitle;
              }
            }
          } catch (e) {}
        });
    };

    loadSiteSettings();
    const interval = setInterval(loadSiteSettings, 3000);
    window.addEventListener('techno_settings_updated', loadSiteSettings);
    window.addEventListener('storage', loadSiteSettings);

    const handleClickOutside = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setIsLangDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(interval);
      window.removeEventListener('techno_settings_updated', loadSiteSettings);
      window.removeEventListener('storage', loadSiteSettings);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClose = (e: Event) => {
      if (e.type === 'mousedown' || e.type === 'touchstart') {
        const target = (e as MouseEvent | TouchEvent).target as Node;
        if (searchContainerRef.current && searchContainerRef.current.contains(target)) {
          return;
        }
      }
      setSearchQuery('');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClose);
    document.addEventListener('touchstart', handleClose, { passive: true });
    window.addEventListener('scroll', handleClose, { passive: true });
    window.addEventListener('wheel', handleClose, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClose);
      document.removeEventListener('touchstart', handleClose);
      window.removeEventListener('scroll', handleClose);
      window.removeEventListener('wheel', handleClose);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const updateCounts = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('technomania_cart') || '[]');
        setCartCount(Array.isArray(cart) ? cart.length : 0);
      } catch (e) { setCartCount(0); }

      try {
        const favs = JSON.parse(localStorage.getItem('technomania_favorites') || '[]');
        setFavCount(Array.isArray(favs) ? favs.length : 0);
      } catch (e) { setFavCount(0); }

      try {
        const comp = JSON.parse(localStorage.getItem('technomania_compare') || '[]');
        setCompareCount(Array.isArray(comp) ? comp.length : 0);
      } catch (e) { setCompareCount(0); }
    };

    updateCounts();
    window.addEventListener('storage', updateCounts);
    const interval = setInterval(updateCounts, 1000);

    const savedDark = localStorage.getItem('technomania_dark') === 'true';
    if (externalDarkMode === undefined) setInternalDarkMode(savedDark);

    const savedLang = (localStorage.getItem('technomania_lang') as Language) || 'AZ';
    if (externalLang === undefined) setInternalLang(savedLang);

    const checkCustomer = () => {
      try {
        const saved = localStorage.getItem('technomania_customer_user');
        if (saved) setCustomerUser(JSON.parse(saved));
        else setCustomerUser(null);
      } catch (e) {
        setCustomerUser(null);
      }
    };
    checkCustomer();
    const handleAuthChange = (e: any) => {
      if (e?.detail) setCustomerUser(e.detail);
      else checkCustomer();
    };
    window.addEventListener('technomania_customer_auth_changed', handleAuthChange);

    return () => {
      window.removeEventListener('storage', updateCounts);
      window.removeEventListener('technomania_customer_auth_changed', handleAuthChange);
      clearInterval(interval);
    };
  }, [externalDarkMode, externalLang]);

  const handleLangChange = (lang: Language) => {
    setCurrentLang(lang);
    localStorage.setItem('technomania_lang', lang);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      {/* ═══ 1. TOP ANNOUNCEMENT CAMPAIGN BANNER ═══ */}
      <div
        className="text-white text-xs sm:text-sm font-black py-2.5 px-4 text-center tracking-wide flex items-center justify-center gap-2 shadow-xs border-b border-black/10"
        style={{ backgroundColor: siteSettings.primaryColor || '#4f533b' }}
      >
        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-stone-200 flex-shrink-0" />
        <span className="truncate">{t.announcement}</span>
      </div>

      {/* ═══ 2. TOP NAV SUB-BAR (Contact, Lang, Theme) ═══ */}
      <div className={`relative z-[60] text-xs sm:text-sm py-1.5 sm:py-2.5 px-3 sm:px-5 lg:px-6 transition-colors border-b ${isDarkMode ? 'bg-slate-900 text-slate-200 border-slate-800' : 'bg-slate-50 text-slate-800 border-slate-200/70'}`}>
        <div className="w-full max-w-[1560px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 font-bold min-w-0 flex-1 overflow-x-auto scrollbar-hide py-0.5">
            <a
              href={`tel:${(siteSettings as any).phone1 || '171'}`}
              className="flex items-center gap-1.5 whitespace-nowrap text-[11px] sm:text-xs flex-shrink-0 hover:opacity-80 transition-opacity"
            >
              <PhoneCall className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4f533b] shrink-0" style={{ color: siteSettings.primaryColor || '#4f533b' }} />
              <span className="inline-flex items-center gap-1 font-black">
                <span suppressHydrationWarning className="px-1.5 py-0.5 rounded-md bg-[#4f533b]/10 text-[#4f533b] dark:text-emerald-400">
                  {(siteSettings as any).phone1 || '171'}
                </span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">Qaynar Xətt</span>
              </span>
            </a>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <span className="hidden sm:flex items-center gap-2 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300 font-semibold">
              <Clock className="w-3.5 h-3.5 text-[#4f533b]" style={{ color: siteSettings.primaryColor || '#4f533b' }} /> 09:00 - 21:00 (Hər gün)
            </span>
            <span className="text-slate-300 dark:text-slate-700 flex-shrink-0">•</span>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('techno_open_stores_modal'));
                }
              }}
              className="flex items-center gap-1.5 whitespace-nowrap hover:underline cursor-pointer text-slate-900 dark:text-white font-extrabold text-[11px] sm:text-xs transition-colors hover:text-[#4f533b] flex-shrink-0"
            >
              <MapPin className="w-3.5 h-3.5 text-[#4f533b]" style={{ color: siteSettings.primaryColor || '#4f533b' }} />
              <span>Mağazalarımız</span>
            </button>
          </div>

            {/* Rich Language Dropdown */}
          <div className="relative flex-shrink-0 z-[65]" ref={langDropdownRef}>
            <button
              type="button"
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition-all cursor-pointer text-xs font-black shadow-xs active:scale-95 ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:border-slate-600'
                  : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
              }`}
              aria-label="Dil seçimi"
            >
              <span className="flex items-center justify-center">{renderFlag(currentLang)}</span>
              <span>{currentLang}</span>
              <span className={`text-[10px] transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {isLangDropdownOpen && (
              <div
                className={`absolute right-0 top-full mt-1.5 w-36 rounded-2xl border shadow-2xl py-1.5 z-[70] animate-fadeIn backdrop-blur-md ${
                  isDarkMode
                    ? 'bg-slate-900/95 border-slate-700 text-slate-200'
                    : 'bg-white/95 border-slate-200 text-slate-800'
                }`}
              >
                {LANGUAGES.map((l) => {
                  const isSelected = l.code === currentLang;
                  return (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => {
                        handleLangChange(l.code);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs font-extrabold flex items-center justify-between transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#4f533b]/10 text-[#4f533b] dark:text-[#a3a886]'
                          : isDarkMode
                          ? 'hover:bg-slate-800 text-slate-300'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="flex items-center justify-center">{renderFlag(l.code)}</span>
                        <span>{l.name}</span>
                      </span>
                      {isSelected && <span className="text-[#4f533b] dark:text-[#a3a886]">✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ 2. MAIN STICKY HEADER ═══ */}
      <header className={`border-b sticky top-0 z-50 shadow-xs relative transition-colors backdrop-blur-md ${isDarkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200/80'}`}>
        <div className="w-full max-w-[1560px] mx-auto px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4">

          {/* Left Brand Group: Burger + Logo */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Mobile: Burger menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden flex items-center justify-center w-9 h-9 rounded-xl transition cursor-pointer flex-shrink-0 active:scale-95 ${
                isDarkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              aria-label="Menyu"
            >
              {isMobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
            </button>

            {/* Logos — Render side by side with clean dynamic spacing & individual height */}
            <div
              suppressHydrationWarning
              className="flex items-center cursor-pointer select-none transition-all duration-150 flex-shrink-1 overflow-hidden"
              style={{ gap: `${siteSettings.logoGap !== undefined ? siteSettings.logoGap : 12}px` }}
              onClick={() => router.push('/')}
            >
              {availableLogos.length > 0 ? (
                availableLogos.map((logoSrc: string, idx: number) => {
                  const itemHeight = idx === 0 ? (siteSettings.logo1Height || siteSettings.logoHeight || 36) : idx === 1 ? (siteSettings.logo2Height || siteSettings.logoHeight || 36) : (siteSettings.logo3Height || siteSettings.logoHeight || 36);
                  return (
                    <img 
                      key={idx}
                      src={logoSrc} 
                      alt={`TechnoMania ${idx + 1}`} 
                      style={{
                        height: `${itemHeight}px`,
                        maxHeight: '90px'
                      }}
                      className="w-auto object-contain max-w-[90px] sm:max-w-[160px] md:max-w-[240px] transition-all duration-200 hover:scale-105" 
                      onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                    />
                  );
                })
              ) : null}
            </div>
          </div>

          {/* Desktop: Catalog + Search */}
          <div className="hidden md:flex flex-1 items-center gap-2 sm:gap-3 mx-2">
            <button
              id="catalog-toggle-button"
              data-catalog-toggle="true"
              onClick={() => setIsCatalogModalOpen(prev => !prev)}
              className="text-white font-black px-5 py-3 rounded-xl flex items-center gap-2 text-base transition shadow-md flex-shrink-0 cursor-pointer hover:opacity-90 active:scale-95"
              style={{ backgroundColor: siteSettings.primaryColor || '#4f533b' }}
            >
              {isCatalogModalOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              <span>{t.catalog}</span>
            </button>
            <form ref={searchContainerRef} onSubmit={handleSearchSubmit} className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className={`w-full border border-transparent rounded-xl pl-4 pr-12 py-3 text-base font-semibold outline-none transition placeholder:text-slate-400 ${isDarkMode ? 'bg-slate-800 text-white focus:bg-slate-900' : 'bg-[#f1f5f9] focus:bg-white text-slate-900'}`}
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 text-white rounded-lg px-3.5 transition flex items-center justify-center cursor-pointer hover:opacity-90 active:scale-95"
                style={{ backgroundColor: siteSettings.primaryColor || '#4f533b' }}
              >
                <Search className="w-4.5 h-4.5" />
              </button>
              <SearchAutocompleteDropdown
                query={searchQuery}
                onClose={() => setSearchQuery('')}
                isDarkMode={isDarkMode}
              />
            </form>
          </div>

          {/* Desktop: User Actions */}
          <div className="hidden md:flex items-center gap-4 sm:gap-6 flex-shrink-0">
            {/* Compare */}
            <button
              onClick={() => router.push('/compare')}
              className={`flex flex-col items-center gap-1 transition relative cursor-pointer active:scale-90 group ${
                isDarkMode ? 'text-slate-300 hover:text-[#4f533b]' : 'text-slate-600 hover:text-[#4f533b]'
              }`}
            >
              <div className="relative">
                <Scale className="w-5.5 h-5.5 transition-transform group-hover:scale-110" />
                {compareCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-[#4f533b] text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center shadow-md animate-scaleUp">
                    {compareCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold tracking-normal">{t.compare}</span>
            </button>

            {/* Wishlist */}
            <button
              onClick={() => router.push('/wishlist')}
              className={`flex flex-col items-center gap-1 transition relative cursor-pointer active:scale-90 group ${
                isDarkMode ? 'text-slate-300 hover:text-[#4f533b]' : 'text-slate-600 hover:text-[#4f533b]'
              }`}
            >
              <div className="relative">
                <Heart className={`w-5.5 h-5.5 transition-transform group-hover:scale-110 ${favCount > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
                {favCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-rose-500 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center shadow-md animate-scaleUp">
                    {favCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold tracking-normal">{t.wishlist}</span>
            </button>

            {/* Cart */}
            <button
              onClick={() => {
                if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('techno_open_cart_drawer'));
              }}
              className={`flex flex-col items-center gap-1 transition relative cursor-pointer active:scale-90 group ${
                isDarkMode ? 'text-slate-300 hover:text-[#4f533b]' : 'text-slate-600 hover:text-[#4f533b]'
              }`}
            >
              <div className="relative">
                <ShoppingCart className="w-5.5 h-5.5 transition-transform group-hover:scale-110" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-[#4f533b] text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center shadow-md animate-scaleUp">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold tracking-normal">{t.cart}</span>
            </button>
            {/* User Account / Login Button — Opens Auth Modal or Navigates to /profile */}
            {customerUser ? (
              <button
                type="button"
                onClick={() => router.push('/profile')}
                className={`flex flex-col items-center gap-1 transition cursor-pointer active:scale-90 group outline-none select-none ${
                  isDarkMode ? 'text-slate-300 hover:text-[#4f533b]' : 'text-slate-600 hover:text-[#4f533b]'
                }`}
                title={`Profil: ${customerUser.name || 'Müştəri'}`}
                aria-label="Profil"
              >
                <div className="w-7 h-7 rounded-full bg-[#4f533b] text-white flex items-center justify-center font-black text-xs shadow-xs border border-white/20 transition-all group-hover:scale-110">
                  {(() => {
                    const parts = String(customerUser.name || 'U').trim().split(/\s+/);
                    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
                    return parts[0].slice(0, 2).toUpperCase();
                  })()}
                </div>
                <span className="text-xs font-bold tracking-normal truncate max-w-[70px]">
                  {String(customerUser.name || 'Profil').split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('techno_open_auth_modal'));
                }}
                className={`flex flex-col items-center gap-1 transition cursor-pointer active:scale-90 group outline-none select-none ${
                  isDarkMode ? 'text-slate-300 hover:text-[#4f533b]' : 'text-slate-600 hover:text-[#4f533b]'
                }`}
                title="Daxil ol / Qeydiyyat"
                aria-label="Daxil ol"
              >
                <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 transition-all group-hover:scale-110 group-hover:bg-[#4f533b]/10 group-hover:border-[#4f533b]/30">
                  <User className="w-4 h-4 text-slate-700 dark:text-slate-200 group-hover:text-[#4f533b]" />
                </div>
                <span className="text-xs font-bold tracking-normal">{t.login}</span>
              </button>
            )}
          </div>

          {/* Mobile App Bar Actions: Compact, Tightly-Grouped Icons */}
          <div className="md:hidden flex items-center gap-1.5 flex-shrink-0">
            {/* Search Icon */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className={`flex items-center justify-center w-9 h-9 rounded-xl transition cursor-pointer active:scale-95 ${
                isMobileSearchOpen
                  ? 'bg-[#4f533b] text-white shadow-xs'
                  : isDarkMode
                  ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              aria-label="Axtarış"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Wishlist Icon */}
            <button
              onClick={() => router.push('/wishlist')}
              className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition cursor-pointer active:scale-95 ${
                isDarkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              aria-label="Seçilmişlər"
            >
              <Heart className={`w-4 h-4 ${favCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
              {favCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {favCount}
                </span>
              )}
            </button>

            {/* Cart Icon */}
            <button
              onClick={() => { if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('techno_open_cart_drawer')); }}
              className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition cursor-pointer active:scale-95 ${
                cartCount > 0
                  ? 'bg-[#4f533b] text-white shadow-xs'
                  : isDarkMode
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

            {/* User Account Icon */}
            {customerUser ? (
              <button
                onClick={() => router.push('/profile')}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#4f533b] text-white font-black text-xs transition cursor-pointer active:scale-95 shadow-xs"
                aria-label="Profil"
              >
                {(() => {
                  const parts = String(customerUser.name || 'U').trim().split(/\s+/);
                  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
                  return parts[0].slice(0, 2).toUpperCase();
                })()}
              </button>
            ) : (
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('techno_open_auth_modal'));
                }}
                className={`flex items-center justify-center w-9 h-9 rounded-xl transition cursor-pointer active:scale-95 ${
                  isDarkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                aria-label="Daxil ol"
              >
                <User className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile: Expandable Slide-down Search Bar */}
        {isMobileSearchOpen && (
          <div className={`md:hidden px-3 pb-3 pt-1 border-t ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="relative">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchQuery.trim() && router.push(`/search?q=${encodeURIComponent(searchQuery)}`)}
                placeholder={t.searchPlaceholder}
                className={`w-full border focus:border-[#4f533b] rounded-xl pl-4 pr-11 py-2.5 text-sm outline-none transition placeholder:text-slate-400 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-[#f1f5f9] border-slate-200 text-slate-900'}`}
              />
              <button
                onClick={() => searchQuery.trim() && router.push(`/search?q=${encodeURIComponent(searchQuery)}`)}
                className="absolute right-1 top-1 bottom-1 bg-[#4f533b] hover:bg-[#3e4230] text-white rounded-lg px-3 transition flex items-center justify-center cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
              <SearchAutocompleteDropdown
                query={searchQuery}
                onClose={() => setSearchQuery('')}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
        )}

        {/* Mobile: Burger Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className={`md:hidden border-t px-4 py-4 space-y-4 animate-fadeIn ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsCatalogModalOpen(true);
                }}
                className="w-full bg-[#4f533b] text-white font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Menu className="w-4 h-4" /> Bütün Kataloq & Kateqoriyalar
                </span>
                <span>→</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => { setIsMobileMenuOpen(false); router.push('/compare'); }}
                className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center gap-2"
              >
                <Scale className="w-4 h-4 text-[#4f533b]" /> Müqayisə ({compareCount})
              </button>

              <button
                onClick={() => { setIsMobileMenuOpen(false); router.push('/wishlist'); }}
                className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center gap-2"
              >
                <Heart className="w-4 h-4 text-rose-500" /> Seçilmişlər ({favCount})
              </button>

              <button
                onClick={() => { setIsMobileMenuOpen(false); if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('techno_open_cart_drawer')); }}
                className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4 text-[#4f533b]" /> Səbətim ({cartCount})
              </button>

              <button
                onClick={() => { setIsMobileMenuOpen(false); router.push('/login'); }}
                className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-[#4f533b]" /> Şəxsi Kabinet
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('techno_open_stores_modal'));
                  }
                }}
                className="flex items-center gap-1.5 text-[#4f533b] cursor-pointer"
              >
                <MapPin className="w-4 h-4" /> Mağazalarımız
              </button>

              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
                <span>{isDarkMode ? 'Açıq Rejim' : 'Tünd Rejim'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Catalog Modal Mega Dropdown */}
        <CatalogModal
          isOpen={isCatalogModalOpen}
          onClose={() => setIsCatalogModalOpen(false)}
          onSelectCategory={(catName) => {
            setIsCatalogModalOpen(false);
            router.push(`/category/${toSlug(catName)}`);
          }}
          isDarkMode={isDarkMode}
        />
      </header>
    </>
  );
}
