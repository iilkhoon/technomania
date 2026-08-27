'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck,
  ShieldCheck,
  CreditCard,
  RotateCcw,
  Sparkles,
  Headphones,
  CheckCircle2,
  Zap,
  Tag,
  Award,
} from './HeroIconsHub';

export interface FeatureBadgeItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
}

const DEFAULT_BADGES: FeatureBadgeItem[] = [
  {
    id: 'badge-1',
    title: 'Qapıda rəsmiləşdirmə',
    subtitle: 'Nağd, hissə-hissə və ya kartla ödəmə imkanı',
    icon: 'CreditCard',
    is_active: true,
    sort_order: 1
  },
  {
    id: 'badge-2',
    title: 'Zəmanət seçimi',
    subtitle: 'İstehsalçı zəmanəti, qızıl zəmanət, zəmanət plus',
    icon: 'ShieldCheck',
    is_active: true,
    sort_order: 2
  },
  {
    id: 'badge-3',
    title: 'Pulsuz çatdırılma',
    subtitle: '49.99AZN-dən yuxarı sifarişlərə pulsuz çatdırılma',
    icon: 'Truck',
    is_active: true,
    sort_order: 3
  },
  {
    id: 'badge-4',
    title: 'Ən yaxşı qiymətə zəmanət!',
    subtitle: 'Daha ucuz tap, qiymət fərqinin 120%-ni geri al',
    icon: 'Award',
    is_active: true,
    sort_order: 4
  }
];

const renderIcon = (iconName: string) => {
  switch (iconName) {
    case 'ShieldCheck':
    case 'Shield':
      return (
        <div className="flex items-center justify-center flex-shrink-0 text-[#4f533b] dark:text-[#a3a886]">
          <ShieldCheck className="w-8 h-8 sm:w-9 sm:h-9 stroke-[1.75]" />
        </div>
      );
    case 'CreditCard':
    case 'Card':
      return (
        <div className="flex items-center justify-center flex-shrink-0 text-[#4f533b] dark:text-[#a3a886]">
          <CreditCard className="w-8 h-8 sm:w-9 sm:h-9 stroke-[1.75]" />
        </div>
      );
    case 'Award':
    case 'Badge':
    case 'Tag':
      return (
        <div className="flex items-center justify-center flex-shrink-0 text-[#4f533b] dark:text-[#a3a886]">
          <Award className="w-8 h-8 sm:w-9 sm:h-9 stroke-[1.75]" />
        </div>
      );
    case 'RotateCcw':
      return (
        <div className="flex items-center justify-center flex-shrink-0 text-[#4f533b] dark:text-[#a3a886]">
          <RotateCcw className="w-8 h-8 sm:w-9 sm:h-9 stroke-[1.75]" />
        </div>
      );
    case 'Headphones':
      return (
        <div className="flex items-center justify-center flex-shrink-0 text-[#4f533b] dark:text-[#a3a886]">
          <Headphones className="w-8 h-8 sm:w-9 sm:h-9 stroke-[1.75]" />
        </div>
      );
    case 'Zap':
      return (
        <div className="flex items-center justify-center flex-shrink-0 text-[#4f533b] dark:text-[#a3a886]">
          <Zap className="w-8 h-8 sm:w-9 sm:h-9 stroke-[1.75]" />
        </div>
      );
    case 'Truck':
    default:
      return (
        <div className="flex items-center justify-center flex-shrink-0 text-[#4f533b] dark:text-[#a3a886]">
          <Truck className="w-8 h-8 sm:w-9 sm:h-9 stroke-[1.75]" />
        </div>
      );
  }
};

interface FeatureBadgesProps {
  isDarkMode?: boolean;
}

export default function FeatureBadges({ isDarkMode = false }: FeatureBadgesProps) {
  const [badges, setBadges] = useState<FeatureBadgeItem[]>(DEFAULT_BADGES);

  useEffect(() => {
    fetch('/api/catalog/badges', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const activeOnly = data.filter((b: any) => b.is_active !== false);
          if (activeOnly.length > 0) {
            setBadges(activeOnly.slice(0, 4));
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="hidden md:block w-full max-w-[1560px] mx-auto px-3 sm:px-5 lg:px-6 my-4 sm:my-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
        {badges.slice(0, 4).map((badge) => (
          <div
            key={badge.id}
            className={`group p-4 sm:p-4.5 rounded-2xl border transition-all duration-200 flex items-center gap-3.5 ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
            }`}
          >
            {/* Clean Linear Icon on Left */}
            <div className="flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
              {renderIcon(badge.icon)}
            </div>

            {/* Title & Subtitle */}
            <div className="min-w-0 flex-1">
              <h4 className="text-xs sm:text-[13.5px] font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
                {badge.title}
              </h4>
              {badge.subtitle && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-snug mt-0.5 line-clamp-2">
                  {badge.subtitle}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
