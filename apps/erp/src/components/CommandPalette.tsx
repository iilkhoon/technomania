'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  Package,
  Plus,
  Warehouse,
  FolderTree,
  Award,
  ShoppingCart,
  Users,
  Percent,
  Sliders,
  ArrowRight,
  Command,
  FileText,
  MessageSquare,
  HelpCircle,
  Ticket,
  BarChart3,
  MapPin,
  Image as ImageIcon,
  Tag,
  Clock,
  X,
} from './HeroIconsHub';
import { getLocalProducts, getLocalCategories } from '../lib/supabase';

interface NavItem {
  id: string;
  title: string;
  category: string;
  href: string;
  keywords: string;
  icon: any;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'cmd-dashboard', title: 'Dashboard Paneli', category: 'Əsas', href: '/', keywords: 'dashboard statistika ana sehife panel', icon: LayoutDashboard },
  { id: 'cmd-products', title: 'Məhsullar Kataloqu', category: 'Kataloq', href: '/products', keywords: 'mehsul mehsullar kataloq stok qiymet', icon: Package },
  { id: 'cmd-new-product', title: 'Yeni Məhsul Əlavə Et', category: 'Kataloq', href: '/products/new', keywords: 'yeni mehsul elave et yarat forma', icon: Plus },
  { id: 'cmd-inventory', title: 'Anbar & Stok İdarəetməsi', category: 'Kataloq', href: '/inventory', keywords: 'anbar stok say qaliq sklad', icon: Warehouse },
  { id: 'cmd-categories', title: 'Kateqoriyalar & Bölmələr', category: 'Kataloq', href: '/categories', keywords: 'kateqoriya kateqoriyalar bolmeler parent level', icon: FolderTree },
  { id: 'cmd-brands', title: 'Brendlər & Markalar', category: 'Kataloq', href: '/brands', keywords: 'brend brendler marka markalar apple samsung xiaomi', icon: Award },
  { id: 'cmd-pricing', title: 'Toplu Qiymət & Endirimlər', category: 'Kataloq', href: '/pricing', keywords: 'qiymet endirim toplu aksiya deyer', icon: Percent },
  { id: 'cmd-orders', title: 'Sifarişlər & Satışlar', category: 'Satışlar', href: '/orders', keywords: 'sifaris sifarisler satis kassa nagd kredit', icon: ShoppingCart },
  { id: 'cmd-customers', title: 'Müştərilər & CRM', category: 'Müştərilər', href: '/customers', keywords: 'musteri musteriler crm alici istifadeci', icon: Users },
  { id: 'cmd-employees', title: 'Əməkdaşlar & Rollar', category: 'İşçilər', href: '/employees', keywords: 'isci isçiler emekdas emekdaslar rol admin', icon: Users },
  { id: 'cmd-homepage', title: 'Ana Səhifə Ayarları & Vitrin', category: 'Marketinq', href: '/homepage-settings', keywords: 'ana sehife vitrin one cixanlar slider', icon: LayoutDashboard },
  { id: 'cmd-banners', title: 'Bannerlər & Slayderlər', category: 'Marketinq', href: '/banners', keywords: 'banner bannerler reklam slayd slider sekil', icon: ImageIcon },
  { id: 'cmd-coupons', title: 'Kampaniyalar & Badge-lər', category: 'Marketinq', href: '/coupons', keywords: 'kampaniya badge etiket aksiya', icon: Ticket },
  { id: 'cmd-promos', title: 'Kuponlar & Promokodlar', category: 'Marketinq', href: '/promos', keywords: 'kupon promokod endirim kodu', icon: Tag },
  { id: 'cmd-stores', title: 'Mağazalar & Filiallar', category: 'Marketinq', href: '/stores', keywords: 'magaza filial unvan unvanlar lokasiya', icon: MapPin },
  { id: 'cmd-analytics', title: 'Analitika & Hesabatlar', category: 'Marketinq', href: '/analytics', keywords: 'analitika dovriyye statistika hesabat qazanc', icon: BarChart3 },
  { id: 'cmd-settings', title: 'Sayt Ayarları & Loqo', category: 'Ayarlar', href: '/settings', keywords: 'ayarlar tenzimlemeler loqo parametr', icon: Sliders },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Live products & categories
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      const p = getLocalProducts() || [];
      const c = getLocalCategories() || [];
      setProducts(p);
      setCategories(c);
    }
  }, [isOpen]);

  // Unified Search Results
  const q = search.toLowerCase().trim();

  const filteredNav = NAV_ITEMS.filter(item =>
    !q ||
    item.title.toLowerCase().includes(q) ||
    item.category.toLowerCase().includes(q) ||
    item.keywords.toLowerCase().includes(q)
  );

  const filteredProducts = q
    ? products.filter(p =>
        (p.name || p.model_name || '').toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q)
      ).slice(0, 5)
    : [];

  const filteredCategories = q
    ? categories.filter(c =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.slug || '').toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const allItemsCount = filteredNav.length + filteredProducts.length + filteredCategories.length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }

      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleOpenEvent = () => setIsOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('techno_open_command_palette', handleOpenEvent);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('techno_open_command_palette', handleOpenEvent);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleSelect = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-20 sm:pt-28 px-4 animate-fadeIn">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden text-slate-800 flex flex-col max-h-[80vh]"
      >
        {/* Search input bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-3 bg-white flex-shrink-0">
          <Search className="w-5 h-5 text-[#4f533b] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Modul, səhifə, məhsul və ya kateqoriya axtarın..."
            value={search}
            onChange={e => { setSearch(e.target.value); setSelectedIndex(0); }}
            className="w-full text-sm sm:text-base outline-none bg-transparent placeholder:text-slate-400 font-semibold text-slate-900"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="overflow-y-auto p-3 space-y-4 flex-1 scrollbar-thin">
          
          {/* 1. Live Products Section */}
          {filteredProducts.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-slate-400 tracking-wider px-2 block">
                📦 Məhsullar ({filteredProducts.length})
              </span>
              <div className="space-y-1">
                {filteredProducts.map(p => (
                  <div
                    key={p.id}
                    onClick={() => handleSelect('/products')}
                    className="p-2.5 rounded-2xl flex items-center justify-between cursor-pointer transition hover:bg-[#f4f5f0] border border-slate-100 hover:border-[#4f533b]/20 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[#4f533b] flex-shrink-0 border border-slate-200">
                        <Package className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 block truncate">{p.name || p.model_name}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{p.brand || 'Ümumi'} • Stok: {p.stock || 0} ədəd</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-black text-[#4f533b]">{p.cash_price} ₼</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#4f533b] transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Live Categories Section */}
          {filteredCategories.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-slate-400 tracking-wider px-2 block">
                📁 Kateqoriyalar ({filteredCategories.length})
              </span>
              <div className="space-y-1">
                {filteredCategories.map(c => (
                  <div
                    key={c.id}
                    onClick={() => handleSelect('/categories')}
                    className="p-2.5 rounded-2xl flex items-center justify-between cursor-pointer transition hover:bg-[#f4f5f0] border border-slate-100 hover:border-[#4f533b]/20 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-emerald-600 flex-shrink-0 border border-slate-200">
                        <FolderTree className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{c.name}</span>
                        <span className="text-[10px] text-slate-400">/{c.full_slug || c.slug}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. ERP Modules & Pages */}
          {filteredNav.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-slate-400 tracking-wider px-2 block">
                ⚡ ERP Modulları & Səhifələr
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {filteredNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item.href)}
                      className="p-2.5 rounded-2xl flex items-center justify-between cursor-pointer transition hover:bg-[#f4f5f0] border border-slate-100 hover:border-[#4f533b]/20 group text-slate-700"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-[#4f533b] border border-slate-200 flex-shrink-0 group-hover:bg-[#4f533b] group-hover:text-white transition-colors">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold block text-slate-900 truncate">{item.title}</span>
                          <span className="text-[10px] text-slate-400 block">{item.category}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#4f533b] transition-transform group-hover:translate-x-0.5 flex-shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {allItemsCount === 0 && (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-bold text-slate-600">"{search}" üzrə heç bir modul və ya məhsul tapılmadı</p>
              <p className="text-[11px] text-slate-400">Açar sözü dəyişərək yenidən axtarın</p>
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500 font-semibold flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">↵</kbd> Keçid et</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">ESC</kbd> Bağla</span>
          </div>
          <span className="font-mono text-[11px] text-[#4f533b] font-bold">⌘K / Ctrl+K</span>
        </div>
      </div>
    </div>
  );
}
