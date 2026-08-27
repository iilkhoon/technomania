'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Edit2, Trash2, CheckCircle, Save, Printer } from '../../../components/HeroIconsHub';

interface ContractTemplate {
  id: string;
  slug: string;
  title: string;
  category: string;
  content: string;
  is_active: boolean;
}

const DEFAULT_TEMPLATES: ContractTemplate[] = [
  {
    id: 'doc-credit-contract',
    slug: 'contracts',
    title: 'Standart Daxili Kredit Müqaviləsi',
    category: 'Kredit Müqaviləsi',
    content: `AZƏRBAYCAN RESPUBLİKASI
DAXİLİ KREDİTLƏ SATIŞ VƏ ÖDƏNİŞ MÜQAVİLƏSİ

1. TƏRƏFLƏR
Bir tərəfdən "TechnoMania" MMC (bundan sonra "Satıcı"), digər tərəfdən aşağıda məlumatları qeyd olunan müştəri (bundan sonra "Alıcı") arasında bu müqavilə bağlanmışdır.

2. MÜQAVİLƏNİN PREDMETİ
Satıcı Alıcıya sifarişdə göstərilən məhsulları daxili kredit şərtləri ilə təhvil verir, Alıcı isə təsdiqlənmiş aylıq ödəniş cədvəlinə uyğun olaraq ödənişləri vaxtında icra etməyi öhdəsinə götürür.

3. TƏRƏFLƏRİN HÜQUQ VƏ ÖHDƏLİKLƏRİ
3.1. Alıcı hər ayın müəyyən olunmuş gününədək aylıq borc məbləğini ödəməlidir.
3.2. Ödəniş gecikdirildikdə hər gecikdirilən gün üçün cərimə faizi tətbiq oluna bilər.
3.3. Bütün məhsullara rəsmi zəmanət talonu təqdim edilir.`,
    is_active: true
  }
];

export default function LegalContractsPage() {
  const [contracts, setContracts] = useState<ContractTemplate[]>(DEFAULT_TEMPLATES);
  const [selected, setSelected] = useState<ContractTemplate>(DEFAULT_TEMPLATES[0]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/catalog/legal', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const list = data.filter((d: any) => d.slug !== 'privacy' && d.slug !== 'terms');
          if (list.length > 0) {
            setContracts(list);
            setSelected(list[0]);
          }
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
        body: JSON.stringify(selected)
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
            <FileText className="w-3.5 h-3.5" />
            <span>Hüquq və Şablonlar</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Müqavilələr və Şablon Mətnlər
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            POS kassa və kredit satışında avtomatik çap olunan müqavilə şablonları və hüquqi aktlar.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-[#4f533b] hover:bg-[#3e4230] text-white font-extrabold text-xs sm:text-sm rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Yadda saxlanılır...' : 'Şablonu Saxla'}</span>
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Müqavilə şablonu uğurla saxlanıldı!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Müqavilənin Adı</label>
          <input
            type="text"
            value={selected.title}
            onChange={e => setSelected({ ...selected, title: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm font-black outline-none focus:border-[#4f533b]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Müqavilə Şablon Mətni (Çap üçün)</label>
          <textarea
            rows={15}
            value={selected.content}
            onChange={e => setSelected({ ...selected, content: e.target.value })}
            className="w-full px-3.5 py-3 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono outline-none focus:border-[#4f533b] leading-relaxed"
          />
        </div>
      </form>
    </div>
  );
}
