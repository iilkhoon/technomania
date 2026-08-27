'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Smartphone, Laptop, Watch, Headphones, Tv, Shield, Zap } from './HeroIconsHub';

interface CategoryItem {
  id: string;
  name: string;
  icon: React.ElementType;
  subcategories: {
    title: string;
    items: { name: string; href: string; badge?: string }[];
  }[];
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'phones',
    name: 'Smartfonlar və Qadjetlər',
    icon: Smartphone,
    subcategories: [
      {
        title: 'Smartfonlar',
        items: [
          { name: 'Apple iPhone 16 / 15', href: '/catalog?category=iphone', badge: 'Yeni' },
          { name: 'Samsung Galaxy S25 / S24', href: '/catalog?category=samsung' },
          { name: 'Xiaomi / Redmi / POCO', href: '/catalog?category=xiaomi' },
          { name: 'Honor & OnePlus', href: '/catalog?category=honor' },
        ],
      },
      {
        title: 'Ağıllı Saatlar & Aksesuarlar',
        items: [
          { name: 'Apple Watch Series 10 / Ultra', href: '/catalog?category=apple-watch' },
          { name: 'Samsung Galaxy Watch 7', href: '/catalog?category=galaxy-watch' },
          { name: 'Qulaqlıqlar (AirPods / Galaxy Buds)', href: '/catalog?category=earbuds' },
          { name: 'Powerbank & Şarj Cihazları', href: '/catalog?category=chargers' },
        ],
      },
    ],
  },
  {
    id: 'laptops',
    name: 'Noutbuklar və Kompüterlər',
    icon: Laptop,
    subcategories: [
      {
        title: 'Noutbuklar',
        items: [
          { name: 'Apple MacBook Pro / Air M3', href: '/catalog?category=macbook', badge: 'Top' },
          { name: 'ASUS ROG / TUF Gaming', href: '/catalog?category=asus' },
          { name: 'Lenovo ThinkPad / IdeaPad', href: '/catalog?category=lenovo' },
          { name: 'HP & Dell Ultrabooks', href: '/catalog?category=hp' },
        ],
      },
      {
        title: 'Kompüter Hissələri',
        items: [
          { name: 'Videokartlar (NVIDIA RTX 4090/4080)', href: '/catalog?category=gpu' },
          { name: 'Prosessorlar (Intel i9 / AMD Ryzen)', href: '/catalog?category=cpu' },
          { name: 'Monitorlar (4K / 144Hz+)', href: '/catalog?category=monitors' },
        ],
      },
    ],
  },
  {
    id: 'tv-audio',
    name: 'Televizorlar və Audio',
    icon: Tv,
    subcategories: [
      {
        title: 'Televizorlar',
        items: [
          { name: 'Samsung QLED & OLED', href: '/catalog?category=samsung-tv' },
          { name: 'LG OLED Evo', href: '/catalog?category=lg-tv' },
          { name: 'Sony Bravia XR', href: '/catalog?category=sony-tv' },
        ],
      },
      {
        title: 'Audio Sistemlər',
        items: [
          { name: 'Soundbar və Ev Kinoteatrı', href: '/catalog?category=soundbar' },
          { name: 'JBL Portativ Dinamikləri', href: '/catalog?category=jbl' },
        ],
      },
    ],
  },
];

export function MegaMenu() {
  const [activeCategory, setActiveCategory] = useState<CategoryItem>(CATEGORIES[0]);

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-all shadow-md shadow-indigo-600/20">
        <Zap className="w-4 h-4 fill-white" />
        <span>Kataloq</span>
      </button>

      {/* Hover Dropdown */}
      <div className="absolute top-full left-0 mt-2 w-[780px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex backdrop-blur-xl">
        {/* Left Side Category List */}
        <div className="w-64 bg-slate-950/80 p-3 border-r border-slate-800 space-y-1">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory.id === cat.id;
            return (
              <button
                key={cat.id}
                onMouseEnter={() => setActiveCategory(cat)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{cat.name}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            );
          })}
        </div>

        {/* Right Side Subcategories Grid */}
        <div className="flex-1 p-6 bg-slate-900/90 grid grid-cols-2 gap-6">
          {activeCategory.subcategories.map((sub, idx) => (
            <div key={idx} className="space-y-3">
              <h4 className="text-xs tracking-wider font-bold text-slate-400 border-b border-slate-800 pb-1.5">
                {sub.title}
              </h4>
              <ul className="space-y-2">
                {sub.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <Link
                      href={item.href}
                      className="group/item flex items-center justify-between text-xs text-slate-300 hover:text-indigo-400 transition-colors"
                    >
                      <span className="group-hover/item:translate-x-1 transition-transform">
                        {item.name}
                      </span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-400 rounded-md border border-indigo-500/30">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
