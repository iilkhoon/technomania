'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck,
  ShieldCheck,
  CreditCard,
  RotateCcw,
  Sparkles,
  Save,
  CheckCircle,
  Zap,
  Tag,
  Headphones,
} from '../../../components/HeroIconsHub';

interface FeatureBadgeItem {
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
    title: 'Pulsuz çatdırılma',
    subtitle: '50 ₼-dən yuxarı bütün sifarişlərə',
    icon: 'Truck',
    is_active: true,
    sort_order: 1
  },
  {
    id: 'badge-2',
    title: '100% rəsmi zəmanət',
    subtitle: 'Orijinal brend zəmanəti',
    icon: 'ShieldCheck',
    is_active: true,
    sort_order: 2
  },
  {
    id: 'badge-3',
    title: '0% ilkin ödəniş',
    subtitle: '18 ayadək faizsiz taksit',
    icon: 'CreditCard',
    is_active: true,
    sort_order: 3
  },
  {
    id: 'badge-4',
    title: '14 gün qaytarmaq imkanı',
    subtitle: 'Şərtsiz dəyişdirmə və geri qaytarma',
    icon: 'RotateCcw',
    is_active: true,
    sort_order: 4
  }
];

const AVAILABLE_ICONS = [
  { label: 'Çatdırılma (Truck)', value: 'Truck' },
  { label: 'Zəmanət (ShieldCheck)', value: 'ShieldCheck' },
  { label: 'Kredit/Kart (CreditCard)', value: 'CreditCard' },
  { label: 'Qaytarma (RotateCcw)', value: 'RotateCcw' },
  { label: 'Dəstək (Headphones)', value: 'Headphones' },
  { label: 'Sürət/Ekspress (Zap)', value: 'Zap' },
  { label: 'Endirim/Qiymət (Tag)', value: 'Tag' },
];

export default function MarketingBadgesPage() {
  const [badges, setBadges] = useState<FeatureBadgeItem[]>(DEFAULT_BADGES);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

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
          setBadges(data);
        }
      })
      .catch(() => {});
  }, []);

  const updateBadge = (index: number, field: keyof FeatureBadgeItem, value: any) => {
    const updated = [...badges];
    updated[index] = { ...updated[index], [field]: value };
    setBadges(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/catalog/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(badges)
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert('Xəta baş verdi');
      }
    } catch (e) {
      alert('Serverlə əlaqə qurulmadı');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4f533b]/10 text-[#4f533b] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Storefront Vizualları</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Banner Altı Üstünlük Badgeləri (Maks. 4 Ədəd)
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Ana səhifədə əsas bannerlərin dərhal altında nümayiş olunan 4 əsas üstünlük kartını redaktə edin.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-[#4f533b] hover:bg-[#3e4230] text-white font-extrabold text-xs sm:text-sm rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Yadda saxlanılır...' : 'Dəyişiklikləri Saxla'}</span>
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Badgelər uğurla yadda saxlanıldı və saytda dərhal aktivləşdirildi!</span>
        </div>
      )}

      {/* 4 Badges Editor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {badges.slice(0, 4).map((badge, idx) => (
          <div key={badge.id || idx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-black text-sm text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#4f533b] text-white flex items-center justify-center text-xs">
                  {idx + 1}
                </span>
                Badge #{idx + 1}
              </span>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                <input
                  type="checkbox"
                  checked={badge.is_active}
                  onChange={e => updateBadge(idx, 'is_active', e.target.checked)}
                  className="w-4 h-4 text-[#4f533b] rounded"
                />
                <span>Aktivdir</span>
              </label>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Başlıq *</label>
                <input
                  type="text"
                  value={badge.title}
                  onChange={e => updateBadge(idx, 'title', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm font-black outline-none focus:border-[#4f533b]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Alt Qısa Mətn</label>
                <input
                  type="text"
                  value={badge.subtitle || ''}
                  onChange={e => updateBadge(idx, 'subtitle', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#4f533b]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">İkon</label>
                <select
                  value={badge.icon}
                  onChange={e => updateBadge(idx, 'icon', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#4f533b] cursor-pointer"
                >
                  {AVAILABLE_ICONS.map(ic => (
                    <option key={ic.value} value={ic.value}>{ic.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
