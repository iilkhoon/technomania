'use client';

import React, { useState, useEffect } from 'react';
import {
  Layout,
  Save,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  Sliders,
} from '../../../components/HeroIconsHub';

interface LayoutSection {
  id: string;
  section_key: string;
  title: string;
  subtitle?: string;
  is_enabled: boolean;
  sort_order: number;
}

const DEFAULT_SECTIONS: LayoutSection[] = [
  { id: 'sec-hero_banners', section_key: 'hero_banners', title: 'Əsas Slayder Bannerlər', is_enabled: true, sort_order: 1 },
  { id: 'sec-feature_badges', section_key: 'feature_badges', title: 'Üstünlük Badgeləri (4 Ədəd)', is_enabled: true, sort_order: 2 },
  { id: 'sec-brands_marquee', section_key: 'brands_marquee', title: 'Brendlər (Sonsuz Marquee)', is_enabled: true, sort_order: 3 },
  { id: 'sec-weekly_offers', section_key: 'weekly_offers', title: 'Həftənin Təklifləri (Super Təkliflər)', is_enabled: true, sort_order: 4 },
  { id: 'sec-top_categories', section_key: 'top_categories', title: 'Top Kateqoriyalar', is_enabled: true, sort_order: 5 },
  { id: 'sec-leader_products', section_key: 'leader_products', title: 'Satış Liderləri (Ən Çox Satılanlar)', is_enabled: true, sort_order: 6 },
  { id: 'sec-great_offers', section_key: 'great_offers', title: 'Möhtəşəm Fürsətlər', is_enabled: true, sort_order: 7 },
  { id: 'sec-youtube_reviews', section_key: 'youtube_reviews', title: 'YouTube Video İcmallar', is_enabled: true, sort_order: 8 },
  { id: 'sec-news_blog', section_key: 'news_blog', title: 'Xəbərlər və Bloq Məqalələri', is_enabled: true, sort_order: 9 },
];

export default function HomepageLayoutManagerPage() {
  const [sections, setSections] = useState<LayoutSection[]>(DEFAULT_SECTIONS);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/catalog/homepage-layout', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const merged = DEFAULT_SECTIONS.map(def => {
            const found = data.find((d: any) => d.section_key === def.section_key);
            return found ? { ...def, ...found } : def;
          }).sort((a, b) => (a.sort_order || 1) - (b.sort_order || 1));
          setSections(merged);
        }
      })
      .catch(() => {});
  }, []);

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const copy = [...sections];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;

    // re-assign sort_orders
    const updated = copy.map((s, idx) => ({ ...s, sort_order: idx + 1 }));
    setSections(updated);
  };

  const toggleSection = (index: number) => {
    const updated = [...sections];
    updated[index].is_enabled = !updated[index].is_enabled;
    setSections(updated);
  };

  const updateTitle = (index: number, title: string) => {
    const updated = [...sections];
    updated[index].title = title;
    setSections(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/catalog/homepage-layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sections)
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
            <Layers className="w-3.5 h-3.5" />
            <span>Marketinq & Dizayn</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Ana Səhifə Görünüşü və Blokların Sıralanması
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Ana səhifədəki bölmələrin ardıcıllığını dəyişin, istədiyiniz bölməni bağlayın və ya başlığını redaktə edin.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-[#4f533b] hover:bg-[#3e4230] text-white font-extrabold text-xs sm:text-sm rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Yadda saxlanılır...' : 'Sıralamanı Saxla'}</span>
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Ana səhifə görünüşü uğurla yadda saxlanıldı və dərhal storefront-da tətbiq edildi!</span>
        </div>
      )}

      {/* Sections List */}
      <div className="space-y-3">
        {sections.map((sec, idx) => (
          <div
            key={sec.section_key}
            className={`p-4 sm:p-5 rounded-3xl border transition flex items-center justify-between gap-4 ${
              sec.is_enabled
                ? 'bg-white border-slate-200 shadow-xs'
                : 'bg-slate-50 border-slate-200/60 opacity-60'
            }`}
          >
            {/* Position & Name */}
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center flex-shrink-0">
                {idx + 1}
              </span>

              <div className="flex-1 min-w-0 space-y-0.5">
                <input
                  type="text"
                  value={sec.title}
                  onChange={e => updateTitle(idx, e.target.value)}
                  className="font-extrabold text-sm text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#4f533b] outline-none w-full truncate"
                />
                <span className="text-[11px] font-mono text-slate-400 block truncate">
                  Key: {sec.section_key}
                </span>
              </div>
            </div>

            {/* Actions: Move Up / Down & Toggle Visibility */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => moveSection(idx, 'up')}
                disabled={idx === 0}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-30 transition cursor-pointer"
                title="Yuxarı qaldır"
              >
                <ArrowUp className="w-4 h-4" />
              </button>

              <button
                onClick={() => moveSection(idx, 'down')}
                disabled={idx === sections.length - 1}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-30 transition cursor-pointer"
                title="Aşağı endir"
              >
                <ArrowDown className="w-4 h-4" />
              </button>

              <button
                onClick={() => toggleSection(idx)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  sec.is_enabled
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-200 text-slate-600 border border-slate-300'
                }`}
              >
                {sec.is_enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{sec.is_enabled ? 'Görünür' : 'Gizlədilib'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
