'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Save, CheckCircle } from '../../../components/HeroIconsHub';

export default function LegalTermsPage() {
  const [title, setTitle] = useState('İstifadəçi Razılaşması və Qaydaları (Terms of Service)');
  const [content, setContent] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/catalog/legal/terms', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
      .then(r => r.json())
      .then(data => {
        if (data && data.title) {
          setTitle(data.title);
          setContent(data.content || '');
          setIsActive(data.is_active ?? true);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/catalog/legal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: 'terms',
          title,
          category: 'İstifadəçi Razılaşması',
          content,
          is_active: isActive
        })
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4f533b]/10 text-[#4f533b] text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Hüquq və Sənədlər</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            İstifadəçi Razılaşması Redaktoru
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Saytda /terms səhifəsində və footer-də nümayiş olunan rəsmi istifadəçi razılaşması mətni.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-[#4f533b] hover:bg-[#3e4230] text-white font-extrabold text-xs sm:text-sm rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Yadda saxlanılır...' : 'Yadda Saxla'}</span>
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>İstifadəçi razılaşması mətni uğurla yadda saxlanıldı və saytda tətbiq edildi!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Sənədin Başlığı</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm font-black outline-none focus:border-[#4f533b]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Razılaşmanın Tam Mətni (Maddələr)</label>
          <textarea
            rows={15}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="İstifadəçi razılaşmasının maddələrini daxil edin..."
            className="w-full px-3.5 py-3 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:border-[#4f533b] font-medium leading-relaxed"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
          <input
            type="checkbox"
            checked={isActive}
            onChange={e => setIsActive(e.target.checked)}
            className="w-4 h-4 text-[#4f533b] rounded"
          />
          <span>Saytda aktiv olsun və nümayiş edilsin</span>
        </label>
      </form>
    </div>
  );
}
