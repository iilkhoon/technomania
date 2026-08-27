'use client';

import React, { useState } from 'react';
import { Search, Save, Globe, Eye, CheckCircle2 } from '../../components/HeroIconsHub';

export default function SeoPage() {
  const [metaTitle, setMetaTitle] = useState('TechnoMania — Elektrotexnika və Smartfonların Rəsmi Onlayn Mağazası');
  const [metaDesc, setMetaDesc] = useState('Ən son model smartfonlar, noutbuklar, məişət texnikası və aksesuarları faizsiz taksit və pulsuz ekspress çatdırılma ilə əldə edin.');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl text-slate-900 flex items-center gap-2">
              <Search className="w-5 h-5 text-[#4f533b]" /> SEO və səhifə tənzimləmələri
            </h1>
            <span className="text-xs bg-[#f4f5f0] text-[#4f533b] border border-[#4f533b]/20 px-2.5 py-0.5 rounded-md">
              Axtarış optimizasiyası
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Google, Yandex və sosial şəbəkələr üçün Meta başlığı və təsvirini təyin edin.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="bg-[#4f533b] hover:bg-[#3e4230] text-white text-sm px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-95 flex-shrink-0"
        >
          <Save className="w-4 h-4" /> Yadda saxla
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> SEO məlumatları uğurla yadda saxlanıldı!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Form Inputs (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <h3 className="text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#4f533b]" /> Ana Səhifə Meta Teqləri
          </h3>

          <div>
            <label className="text-xs text-slate-600 mb-1.5 block">Meta Səhifə Başlığı (Meta Title)</label>
            <input
              type="text"
              value={metaTitle}
              onChange={e => setMetaTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-[#4f533b] transition"
            />
          </div>

          <div>
            <label className="text-xs text-slate-600 mb-1.5 block">Meta Təsvir (Meta Description)</label>
            <textarea
              rows={4}
              value={metaDesc}
              onChange={e => setMetaDesc(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-[#4f533b] transition leading-relaxed"
            />
          </div>
        </div>

        {/* Live Google Preview (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <h3 className="text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#4f533b]" /> Google Axtarış Simulyasiyası
          </h3>

          <div className="p-4 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 text-xs text-emerald-700">
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">T</span>
              <span>https://technomania.az</span>
            </div>
            <h4 className="text-sm font-medium text-blue-700 hover:underline cursor-pointer leading-tight">
              {metaTitle || 'Səhifə Başlığı'}
            </h4>
            <p className="text-xs text-slate-600 line-clamp-2 leading-snug">
              {metaDesc || 'Səhifə haqqında təsvir daxil edilməyib.'}
            </p>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Google axtarış nəticələrində saytınız yuxarıdakı görünüşdə nümayiş olunacaq.
          </p>
        </div>
      </div>
    </div>
  );
}
