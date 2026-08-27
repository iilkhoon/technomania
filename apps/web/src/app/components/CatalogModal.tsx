import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  X, Search, Smartphone, Laptop, Tv, Home as HomeIcon,
  Shirt, Utensils, Scissors, Armchair, Bike, Gamepad2,
  Coffee, Watch, Sparkles, ChevronRight, Grid, Zap, Flame,
  Wind, Sun, HeartPulse, Sliders, CheckCircle2, Tablet,
  Monitor, Cpu, HardDrive, Speaker, Camera, Radio, Printer,
  Joystick, Wifi, BatteryCharging, Plug, Fan, Thermometer,
  Droplets, Microwave, Lightbulb, Lock, Stethoscope, Smile,
  Glasses, Car, Compass, Dumbbell, Tent, Bed, Box, Package,
  ShoppingBag, Tag, Award, Gift, Music, Truck, Phone, Wrench,
  Hammer, Shield, Battery, Scale, CircleDot, FolderTree,
} from './HeroIconsHub';

import { getLocalCategories, getLocalProducts, Category, Product } from '../lib/supabase';

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory?: (categoryName: string) => void;
  isDarkMode?: boolean;
}

const ICON_MAP: Record<string, any> = {
  Wind, Sun, Smartphone, Laptop, Tv, Gamepad2, Home: HomeIcon, HomeIcon, Utensils,
  Scissors, Bike, HeartPulse, Armchair, Shirt, Coffee, Watch, Grid, Tablet,
  Monitor, Cpu, HardDrive, Speaker, Camera, Radio, Printer, Joystick, Wifi,
  BatteryCharging, Plug, Fan, Thermometer, Droplets, Microwave, Flame, Sparkles,
  Lightbulb, Lock, Stethoscope, Smile, Glasses, Car, Compass, Dumbbell, Tent,
  Bed, Box, Package, ShoppingBag, Tag, Award, Gift, Music, Truck, Phone,
  Wrench, Hammer, Shield, Battery, Scale, CircleDot, FolderTree, Folder: FolderTree
};

function getIconComponent(iconName?: string) {
  if (!iconName) return Grid;
  return ICON_MAP[iconName] || Grid;
}

export const KNOWN_BRANDS = [
  'apple', 'samsung', 'xiaomi', 'huawei', 'honor', 'poco', 'infinix',
  'tecno', 'vivo', 'nokia', 'asus', 'lenovo', 'hp', 'dell', 'lg',
  'bosch', 'haier', 'beko', 'dyson', 'sony', 'philips', 'panasonic', 'mitsubishi'
];

export default function CatalogModal({ isOpen, onClose, onSelectCategory, isDarkMode = false }: CatalogModalProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const cats = getLocalCategories();
      const prods = getLocalProducts();
      setCategories(cats || []);
      setProducts(prods || []);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClose = (e: Event) => {
      if (e.type === 'mousedown' || e.type === 'touchstart') {
        const target = (e as MouseEvent | TouchEvent).target as HTMLElement;
        if (
          (modalRef.current && modalRef.current.contains(target)) ||
          target?.closest?.('#catalog-toggle-button') ||
          target?.closest?.('[data-catalog-toggle="true"]')
        ) {
          return;
        }
      }
      onClose();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Small delay so button click toggle doesn't immediately close modal
    const timeout = setTimeout(() => {
      document.addEventListener('mousedown', handleClose);
      document.addEventListener('touchstart', handleClose, { passive: true });
      window.addEventListener('keydown', handleKeyDown);
    }, 50);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mousedown', handleClose);
      document.removeEventListener('touchstart', handleClose);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Level 1 Categories (Ana Kateqoriyalar)
  const level1Categories = categories.filter(c => !c.parent_id || c.level === 1)
    .sort((a, b) => (a.sort_order || 99) - (b.sort_order || 99));

  useEffect(() => {
    if (level1Categories.length > 0 && (!selectedCatId || !level1Categories.some(c => c.id === selectedCatId))) {
      setSelectedCatId(level1Categories[0].id);
    }
  }, [level1Categories, selectedCatId]);

  if (!isOpen) return null;

  const activeCategory = level1Categories.find(c => c.id === selectedCatId) || level1Categories[0];

  // Level 2 Groups for Active Level 1
  const level2Groups = activeCategory
    ? categories.filter(c => c.parent_id === activeCategory.id || (c.level === 2 && !c.parent_id))
        .sort((a, b) => (a.sort_order || 99) - (b.sort_order || 99))
    : [];

  // Helper to get Level 3 items for a Level 2 Group
  const getLevel3Items = (l2Id: string) => {
    return categories.filter(c => c.parent_id === l2Id)
      .sort((a, b) => (a.sort_order || 99) - (b.sort_order || 99));
  };

  // Helper to extract brands for a specific sub-group/category from live products
  const getBrandsForCategory = (catName: string, catSlug: string): string[] => {
    const matched = products.filter(p => {
      if (!p.brand) return false;
      const pCat = (p.category_name || '').toLowerCase();
      const pCatId = p.category_id;
      const targetCat = catName.toLowerCase();
      const targetSlug = catSlug.toLowerCase();

      return pCat.includes(targetCat) || targetCat.includes(pCat) || pCatId.includes(targetSlug);
    });

    const uniqueBrands = Array.from(new Set(matched.map(p => p.brand).filter(Boolean)));
    if (uniqueBrands.length > 0) return uniqueBrands;

    // Fallback default popular brands for smartphones/laptops
    if (catSlug.includes('smartfon') || catName.includes('Smartfon')) {
      return ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'HONOR', 'Poco', 'Infinix', 'Tecno', 'Vivo', 'Nokia'];
    }
    if (catSlug.includes('laptops') || catName.includes('Notbuk')) {
      return ['Apple', 'ASUS', 'Lenovo', 'HP', 'Acer', 'Dell', 'MSI'];
    }
    if (catSlug.includes('plan') || catName.includes('Planşet')) {
      return ['Apple', 'Samsung', 'Xiaomi', 'Lenovo', 'Huawei'];
    }
    return [];
  };

  const handleSelectCategoryPath = (cat: Category, parentCat?: Category) => {
    onClose();
    if (onSelectCategory) {
      onSelectCategory(cat.name);
      return;
    }

    const cleanName = cat.name.toLowerCase().trim();
    const isBrand = KNOWN_BRANDS.some(b => cleanName.includes(b) || b.includes(cleanName));

    if (isBrand && parentCat) {
      const parentPath = parentCat.full_slug || parentCat.slug;
      router.push(`/category/${parentPath}?brand=${encodeURIComponent(cat.name.toLowerCase())}`);
    } else {
      const fullPath = cat.full_slug || cat.slug;
      router.push(`/category/${fullPath}`);
    }
  };

  const handleSelectBrandFilter = (brandName: string, categoryObj?: Category) => {
    onClose();
    const path = categoryObj?.full_slug || categoryObj?.slug || activeCategory?.slug || 'smartphones';
    router.push(`/category/${path}?brand=${encodeURIComponent(brandName.toLowerCase())}`);
  };

  return (
    <div
      className="absolute top-full left-0 right-0 w-full z-[999] px-3 sm:px-6 lg:px-8 py-3 animate-fadeIn"
      onClick={e => e.stopPropagation()}
    >
      <div
        ref={modalRef}
        className={`max-w-[1360px] mx-auto rounded-3xl border shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[82vh] transition-all ${
          isDarkMode ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* ═══ LEFT SIDEBAR: LEVEL 1 CATEGORIES ═══ */}
        <div
          className={`w-80 sm:w-96 flex-shrink-0 overflow-y-auto p-4 space-y-1.5 border-r ${
            isDarkMode ? 'bg-[#090d16] border-slate-800' : 'bg-slate-50/90 border-slate-200/80'
          }`}
        >
          {level1Categories.map(cat => {
            const Icon = getIconComponent(cat.icon);
            const isSelected = cat.id === activeCategory?.id;

            return (
              <button
                key={cat.id}
                onMouseEnter={() => setSelectedCatId(cat.id)}
                onClick={() => handleSelectCategoryPath(cat)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition cursor-pointer text-left ${
                  isSelected
                    ? isDarkMode
                      ? 'bg-slate-800 text-white font-extrabold shadow-xs'
                      : 'bg-slate-200/90 text-slate-900 font-extrabold shadow-xs'
                    : isDarkMode
                    ? 'hover:bg-slate-800/50 text-slate-200 font-bold'
                    : 'hover:bg-slate-100 text-slate-800 font-bold'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-[#4f533b]' : 'text-slate-400'}`} />
                  <span className="text-sm sm:text-base truncate font-bold">{cat.name}</span>
                </div>
                <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-slate-900 dark:text-white' : 'opacity-0'}`} />
              </button>
            );
          })}
        </div>

        {/* ═══ MIDDLE AREA: BAKU ELECTRONICS MULTI-COLUMN LAYOUT ═══ */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 align-start">
          {level2Groups.map(l2 => {
            const l3Items = getLevel3Items(l2.id);
            const dynamicBrands = getBrandsForCategory(l2.name, l2.slug);

            const isDeviceCategory = l2.name.toLowerCase().includes('smartfon') ||
                                     l2.name.toLowerCase().includes('planşet') ||
                                     l2.name.toLowerCase().includes('noutbuk') ||
                                     l2.name.toLowerCase().includes('saat');

            return (
              <div key={l2.id} className="space-y-3">
                {/* Level 2 Subcategory Title */}
                <h4
                  onClick={() => handleSelectCategoryPath(l2, activeCategory)}
                  className="font-black text-base sm:text-lg text-slate-900 dark:text-white tracking-tight border-b pb-2 border-slate-100 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:text-[#4f533b] dark:hover:text-[#a3a886] transition-colors"
                >
                  <span>{l2.name}</span>
                </h4>

                {/* If Device Category (Smartfonlar, Planşetlər, Noutbuklar): List Brands First */}
                {isDeviceCategory && dynamicBrands.length > 0 ? (
                  <ul className="space-y-2">
                    {dynamicBrands.map((bName, bIdx) => (
                      <li key={bIdx}>
                        <button
                          onClick={() => handleSelectBrandFilter(bName, l2)}
                          className="text-xs sm:text-sm transition hover:underline text-left block w-full cursor-pointer text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold"
                        >
                          {bName}
                        </button>
                      </li>
                    ))}
                    <li>
                      <button
                        onClick={() => handleSelectCategoryPath(l2, activeCategory)}
                        className="text-xs font-bold text-[#4f533b] dark:text-indigo-400 hover:underline cursor-pointer block pt-1"
                      >
                        Bütün brendlər →
                      </button>
                    </li>
                  </ul>
                ) : l3Items.length > 0 ? (
                  /* Standard Subcategories List (Qulaqlıqlar, Aksessuarlar, Saatlar) */
                  <ul className="space-y-2">
                    {l3Items.map(l3 => (
                      <li key={l3.id}>
                        <button
                          onClick={() => handleSelectCategoryPath(l3, l2)}
                          className="text-xs sm:text-sm transition hover:underline text-left block w-full cursor-pointer text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold"
                        >
                          {l3.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <button
                    onClick={() => handleSelectCategoryPath(l2, activeCategory)}
                    className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer block"
                  >
                    Bütün {l2.name} →
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* ═══ RIGHT COLUMN: PROMO BANNER CARD ═══ */}
        <div className={`w-64 sm:w-72 p-5 border-l hidden lg:flex flex-col justify-between flex-shrink-0 ${
          isDarkMode ? 'bg-[#090d16] border-slate-800' : 'bg-slate-50/60 border-slate-200/80'
        }`}>
          <div className="space-y-4">
            <div className="w-full h-40 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 p-4 flex flex-col justify-between text-white relative overflow-hidden shadow-sm">
              <div className="space-y-1 relative z-10">
                <span className="text-[10px] font-black tracking-wider bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full inline-block">Xüsusi Fürsət</span>
                <h3 className="font-black text-base leading-snug">Endirimli qiyməti 24 ayadək ödə</h3>
              </div>
              <img
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=400&q=80"
                alt="Promo"
                className="absolute right-0 bottom-0 w-28 h-28 object-contain opacity-80 pointer-events-none drop-shadow"
              />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Kompaniyada İştirak Edən Texnikalar:</span>
              <div className="flex flex-wrap gap-1.5">
                {level1Categories.slice(0, 4).map(cat => (
                  <span key={cat.id} className="text-[11px] font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-lg text-slate-700 dark:text-slate-300">
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {activeCategory && (
            <button
              onClick={() => handleSelectCategoryPath(activeCategory)}
              className="w-full bg-[#4f533b] hover:bg-[#3e4230] text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer shadow-xs"
            >
              Hər şeyə bax ({activeCategory.name}) →
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
