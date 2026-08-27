'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Grid,
  ShoppingCart,
  Heart,
  User,
  X,
  ChevronRight,
  Sparkles,
  PhoneCall,
  Smartphone,
  Laptop,
  Tv,
  Gamepad2,
  Watch,
  Headphones,
  Box,
} from './HeroIconsHub';
import { getLocalCategories, Category } from '../lib/supabase';

const DEFAULT_MOBILE_CATEGORIES = [
  { id: '1', name: 'Smartfonlar', icon: Smartphone },
  { id: '2', name: 'Noutbuklar Və Kompüterlər', icon: Laptop },
  { id: '3', name: 'Televizorlar Və Audio', icon: Tv },
  { id: '4', name: 'Aksesuarlar Və Qadjetlər', icon: Watch },
  { id: '5', name: 'Oyun Konsolları', icon: Gamepad2 },
  { id: '6', name: 'Qulaqlıqlar', icon: Headphones },
  { id: '7', name: 'Məişət Texnikası', icon: Box },
];

export default function BottomMobileNav({
  isDarkMode = false,
}: {
  isDarkMode?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [cartCount, setCartCount] = useState(0);
  const [favCount, setFavCount] = useState(0);
  const [isMobileCatalogOpen, setIsMobileCatalogOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const updateCounts = () => {
    try {
      const savedCart = localStorage.getItem('technomania_cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) setCartCount(parsed.length);
      } else {
        setCartCount(0);
      }
    } catch (e) {
      setCartCount(0);
    }

    try {
      const savedFavs = localStorage.getItem('technomania_favorites');
      if (savedFavs) {
        const parsed = JSON.parse(savedFavs);
        if (Array.isArray(parsed)) setFavCount(parsed.length);
      } else {
        setFavCount(0);
      }
    } catch (e) {
      setFavCount(0);
    }
  };

  useEffect(() => {
    updateCounts();
    window.addEventListener('storage', updateCounts);
    window.addEventListener('techno_cart_updated', updateCounts);
    window.addEventListener('techno_fav_updated', updateCounts);

    const loadedCats = getLocalCategories() || [];
    setCategories(loadedCats);

    return () => {
      window.removeEventListener('storage', updateCounts);
      window.removeEventListener('techno_cart_updated', updateCounts);
      window.removeEventListener('techno_fav_updated', updateCounts);
    };
  }, []);

  // Close catalog drawer on route changes
  useEffect(() => {
    setIsMobileCatalogOpen(false);
  }, [pathname]);

  const navItems = [
    {
      id: 'home',
      label: 'Ana Səhifə',
      icon: Home,
      href: '/',
      isActive: pathname === '/',
    },
    {
      id: 'catalog',
      label: 'Kataloq',
      icon: Grid,
      isAction: true,
      onClick: () => setIsMobileCatalogOpen(true),
      isActive: isMobileCatalogOpen,
    },
    {
      id: 'cart',
      label: 'Səbət',
      icon: ShoppingCart,
      isAction: true,
      onClick: () => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('techno_open_cart_drawer'));
        }
      },
      badge: cartCount,
      isActive: false,
    },
    {
      id: 'wishlist',
      label: 'Seçilmişlər',
      icon: Heart,
      href: '/wishlist',
      badge: favCount,
      isActive: pathname === '/wishlist',
    },
    {
      id: 'account',
      label: 'Hesabım',
      icon: User,
      isAction: true,
      onClick: () => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('technomania_customer_token');
          if (token) {
            router.push('/profile');
          } else {
            window.dispatchEvent(new CustomEvent('techno_open_auth_modal', { detail: { tab: 'login' } }));
          }
        }
      },
      isActive: pathname === '/profile' || pathname === '/login' || pathname === '/register',
    },
  ];

  const displayCategories = categories.length > 0 ? categories : DEFAULT_MOBILE_CATEGORIES;

  return (
    <>
      {/* ── FIXED NATIVE MOBILE BOTTOM NAVIGATION BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] px-1 pt-1.5 pb-[calc(env(safe-area-inset-bottom,0px)+0.35rem)] w-full">
        <div className="grid grid-cols-5 w-full items-center justify-items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.isActive;

            if (item.isAction) {
              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className="flex flex-col items-center justify-center py-1 w-full rounded-xl transition cursor-pointer active:scale-90 relative"
                >
                  <div
                    className={`w-6 h-6 flex items-center justify-center transition-colors relative ${
                      active ? 'text-[#4f533b]' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-1 -right-2 bg-[#4f533b] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-2xs">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold mt-0.5 transition-colors truncate max-w-[65px] ${
                      active ? 'text-[#4f533b] font-black' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.href || '/'}
                className="flex flex-col items-center justify-center py-1 w-full rounded-xl transition cursor-pointer relative active:scale-90"
              >
                <div
                  className={`w-6 h-6 flex items-center justify-center transition-colors relative ${
                    active ? 'text-[#4f533b]' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-2 bg-[#4f533b] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-2xs">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-bold mt-0.5 transition-colors truncate max-w-[65px] ${
                    active ? 'text-[#4f533b] font-black' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── FULL-SCREEN NATIVE MOBILE CATALOG DRAWER ── */}
      {isMobileCatalogOpen && (
        <div
          className="fixed inset-0 z-[10000] md:hidden bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end animate-fadeIn"
          onClick={() => setIsMobileCatalogOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl max-h-[88vh] flex flex-col overflow-hidden animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#4f533b] text-white flex items-center justify-center">
                  <Grid className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Məhsul Kataloqu</h3>
                  <span className="text-[10px] text-slate-400 font-medium">Bütün kateqoriyalar və bölmələr</span>
                </div>
              </div>

              <button
                onClick={() => setIsMobileCatalogOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Categories List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-slate-100 dark:divide-slate-800">
              {displayCategories.map((cat: any, idx) => {
                const IconComponent = cat.icon || Grid;
                return (
                  <div
                    key={cat.id || idx}
                    onClick={() => {
                      setIsMobileCatalogOpen(false);
                      const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                      router.push(`/category/${slug}`);
                    }}
                    className="pt-2.5 pb-2 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl px-2 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#f4f5f0] text-[#4f533b] dark:bg-slate-800 dark:text-[#a3a886] flex items-center justify-center flex-shrink-0">
                        {typeof IconComponent === 'function' ? (
                          <IconComponent className="w-5 h-5" />
                        ) : (
                          <Grid className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">{cat.name}</span>
                        <span className="text-[10px] text-slate-400">Rəsmi zəmanətli məhsullar</span>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                );
              })}
            </div>

            {/* Drawer Footer Contact */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <a href="tel:*0011" className="font-extrabold text-[#4f533b] flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4" /> *0011 Qaynar Xətt
              </a>
              <span className="text-[11px] text-slate-400 font-bold">TechnoMania © 2026</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
