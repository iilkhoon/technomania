'use client';

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Palette,
  Globe,
  Image as ImageIcon,
  CheckCircle2,
  Save,
  Check,
  Search,
  Sparkles,
  UploadCloud,
  X,
  Share2,
  MessageCircle,
  Send,
  Phone,
  PhoneCall,
} from '../../components/HeroIconsHub';
import { getErpHeaders } from '../../lib/supabase';

export interface SiteSettings {
  logos?: string[];
  logoUrl: string;
  logoUrl2?: string;
  logoUrl3?: string;
  logo1Height?: number;
  logo2Height?: number;
  logo3Height?: number;
  logoHeight?: number;
  logoGap?: number;
  erpLogoUrl: string;
  erpTitle: string;
  erpSubtitle: string;
  logoTextPrimary: string;
  logoTextAccent: string;
  tagline: string;
  primaryColor: string;
  faviconUrl: string;
  tabTitle: string;
  tabSlogan: string;
  metaDesc: string;
  metaKeywords: string;
  ogImageUrl: string;
  phone1: string;
  phone2: string;
  phone3: string;
  tiktokPixelId: string;
  facebookPixelId: string;
  linkedinTagId: string;
  googleAnalyticsId: string;
  googleTagManagerId: string;
  microsoftAdsId: string;
  sentryDsn: string;
  recaptchaSiteKey: string;
  socialInstagram: string;
  socialFacebook: string;
  socialTiktok: string;
  socialYoutube: string;
  socialWhatsapp: string;
  socialTelegram: string;
  socialLinkedin: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  logos: [],
  logoUrl: '',
  logoUrl2: '',
  logoUrl3: '',
  logo1Height: 36,
  logo2Height: 36,
  logo3Height: 36,
  logoHeight: 36,
  logoGap: 12,
  erpLogoUrl: '',
  erpTitle: 'Techno ERP',
  erpSubtitle: 'İdarəetmə Paneli',
  logoTextPrimary: '',
  logoTextAccent: '',
  tagline: 'Elektrotexnika və Smartfonların Rəsmi Onlayn Mağazası',
  primaryColor: '#4f533b',
  faviconUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=64&q=80',
  tabTitle: 'TechnoMania — Elektrotexnika və Smartfonlar',
  tabSlogan: 'Rəsmi Zəmanət Və Pulsuz Çatdırılma',
  metaDesc: 'Ən son model smartfonlar, noutbuklar, məişət texnikası və aksesuarları faizsiz taksit və pulsuz ekspress çatdırılma ilə əldə edin.',
  metaKeywords: 'smartfon, noutbuk, televizor, aksessuar, bakı, kredit, taksit',
  ogImageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
  phone1: '171',
  phone2: '+994 (12) 310 00 00',
  phone3: '+994 (50) 288 17 17',
  tiktokPixelId: '',
  facebookPixelId: '',
  linkedinTagId: '',
  googleAnalyticsId: '',
  googleTagManagerId: '',
  microsoftAdsId: '',
  sentryDsn: '',
  recaptchaSiteKey: '',
  socialInstagram: 'https://instagram.com/technomania.az',
  socialFacebook: 'https://facebook.com/technomania.az',
  socialTiktok: 'https://tiktok.com/@technomania.az',
  socialYoutube: 'https://youtube.com/@technomania.az',
  socialWhatsapp: 'https://wa.me/994502881717',
  socialTelegram: 'https://t.me/technomania_az',
  socialLinkedin: 'https://linkedin.com/company/technomania',
};

const COLOR_PRESETS = [
  { name: 'Zeytun Yaşılı (Standart)', hex: '#4f533b' },
  { name: 'Zümrüd Yaşılı', hex: '#059669' },
  { name: 'Kral Mavi', hex: '#2563eb' },
  { name: 'Bənövşəyi', hex: '#7c3aed' },
  { name: 'Qırmızı', hex: '#dc2626' },
  { name: 'Qızılı Narıncı', hex: '#d97706' },
  { name: 'Tünd Slaneş', hex: '#1e293b' },
];

const compressToWebp = (file: File, maxWidth: number, maxHeight: number, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        try {
          const webpDataUrl = canvas.toDataURL('image/webp', 0.92);
          if (webpDataUrl.startsWith('data:image/webp')) {
            callback(webpDataUrl);
            return;
          }
        } catch (err) {}
        callback(canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.90));
      } else {
        callback(e.target?.result as string);
      }
    };
    img.onerror = () => callback(e.target?.result as string);
    img.src = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const headers = getErpHeaders();
    fetch('/api/catalog/settings', {
      cache: 'no-store',
      headers,
    })
      .then(r => {
        if (!r.ok) return fetch('/erp/api/catalog/settings', { cache: 'no-store', headers });
        return r;
      })
      .then(r => (r && r.ok ? r.json() : null))
      .then(data => {
        if (data && typeof data === 'object' && !Array.isArray(data) && !data.statusCode && Object.keys(data).length > 0) {
          const merged = { ...DEFAULT_SITE_SETTINGS, ...data };
          setSettings(merged);
          try { localStorage.setItem('technomania_site_settings', JSON.stringify(merged)); } catch (e) {}
        } else {
          try {
            const saved = localStorage.getItem('technomania_site_settings');
            if (saved) setSettings({ ...DEFAULT_SITE_SETTINGS, ...JSON.parse(saved) });
          } catch (e) {}
        }
      })
      .catch(() => {
        try {
          const saved = localStorage.getItem('technomania_site_settings');
          if (saved) setSettings({ ...DEFAULT_SITE_SETTINGS, ...JSON.parse(saved) });
        } catch (e) {}
      });
  }, []);

  const handleLogo1FileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressToWebp(file, 800, 400, (dataUrl) => {
      setSettings(prev => {
        const nextLogos = [dataUrl, prev.logoUrl2 || '', prev.logoUrl3 || ''].filter(Boolean);
        return { ...prev, logoUrl: dataUrl, logos: nextLogos };
      });
    });
  };

  const handleLogo2FileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressToWebp(file, 800, 400, (dataUrl) => {
      setSettings(prev => {
        const nextLogos = [prev.logoUrl || '', dataUrl, prev.logoUrl3 || ''].filter(Boolean);
        return { ...prev, logoUrl2: dataUrl, logos: nextLogos };
      });
    });
  };

  const handleLogo3FileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressToWebp(file, 800, 400, (dataUrl) => {
      setSettings(prev => {
        const nextLogos = [prev.logoUrl || '', prev.logoUrl2 || '', dataUrl].filter(Boolean);
        return { ...prev, logoUrl3: dataUrl, logos: nextLogos };
      });
    });
  };

  const handleErpLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressToWebp(file, 800, 400, (dataUrl) => {
      setSettings(prev => ({ ...prev, erpLogoUrl: dataUrl }));
    });
  };

  const handleFaviconFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressToWebp(file, 256, 256, (dataUrl) => {
      setSettings(prev => ({ ...prev, faviconUrl: dataUrl }));
    });
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      localStorage.setItem('technomania_site_settings', JSON.stringify(settings));
      window.dispatchEvent(new Event('techno_settings_updated'));
      window.dispatchEvent(new Event('storage'));

      const reqHeaders = getErpHeaders({ 'Content-Type': 'application/json' });
      let res = await fetch('/api/catalog/settings', {
        method: 'POST',
        headers: reqHeaders,
        body: JSON.stringify(settings)
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch('/erp/api/catalog/settings', {
          method: 'POST',
          headers: reqHeaders,
          body: JSON.stringify(settings)
        }).catch(() => null);
      }

      if (!res || !res.ok) {
        throw new Error(`Server returned HTTP ${res?.status || 500}`);
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to save settings:', e);
      alert('Ayarlar yadda saxlanılarkən xəta baş verdi: ' + (e as Error).message);
    }
  };

  return (
    <div className="space-y-5 text-slate-700 max-w-5xl">
      {/* ── Header ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#4f533b]" /> Sayt ayarları və vizuallar
            </h1>
            <span className="text-xs bg-[#f4f5f0] text-[#4f533b] border border-[#4f533b]/20 px-2.5 py-0.5 rounded-md">
              Kustomizasiya
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Saytın loqosunu, mövzu rəngini, brauzer tab ikonu (favicon) və SEO ayarlarını canlı idarə edin.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSave()}
          className="bg-[#4f533b] hover:bg-[#3e4230] text-white text-sm px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-95 flex-shrink-0"
        >
          <Save className="w-4 h-4" /> Yadda saxla
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Sayt ayarları uğurla yadda saxlanıldı və canlı tətbiq edildi!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        {/* ── 1. Loqo & Brend Məlumatları (3 Loqo Dəstəyi) ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <h3 className="text-sm text-slate-900 flex items-center gap-2 font-bold">
              <ImageIcon className="w-4 h-4 text-[#4f533b]" /> Sayt Loqoları (Maksimum 3 Loqo — Yan-yana Estetik Görünüş)
            </h3>
            <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold">
              ⚡ WebP Formatında Avtomatik Sıxılma
            </span>
          </div>

          {/* Live Side-by-Side Logo Preview & Customization Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                Canlı Görünüş (Navbar və Footer-də Yan-Yana Düzülüş):
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {[settings.logoUrl, settings.logoUrl2, settings.logoUrl3].filter(Boolean).length} / 3 loqo aktivdir
              </span>
            </div>
            
            <div 
              className="p-3.5 bg-white rounded-xl border border-slate-200/80 min-h-[72px] flex items-center flex-wrap transition-all duration-150"
              style={{ gap: `${settings.logoGap !== undefined ? settings.logoGap : 12}px` }}
            >
              {[settings.logoUrl, settings.logoUrl2, settings.logoUrl3].filter(Boolean).length > 0 ? (
                [settings.logoUrl, settings.logoUrl2, settings.logoUrl3].filter(Boolean).map((logo, idx) => {
                  const currentH = idx === 0 ? (settings.logo1Height || settings.logoHeight || 36) : idx === 1 ? (settings.logo2Height || settings.logoHeight || 36) : (settings.logo3Height || settings.logoHeight || 36);
                  return (
                    <div key={idx} className="relative group p-1 bg-slate-50 rounded-lg border border-slate-200/60 shadow-2xs">
                      <img
                        src={logo}
                        alt={`Sayt Loqosu ${idx + 1}`}
                        style={{ height: `${currentH}px` }}
                        className="w-auto max-w-[240px] object-contain transition-all duration-150"
                      />
                      <span className="absolute -top-1.5 -right-1.5 bg-[#4f533b] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                        {idx + 1}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-slate-400 italic py-2">
                  Hələ heç bir loqo əlavə edilməyib. Aşağıdakı xanalardan 1, 2 və ya 3 loqo yükləyə bilərsiniz.
                </div>
              )}
            </div>

            {/* Logo Height and Gap Customization Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200/80 text-xs">
              {/* Logo Height (Boyu) */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    📏 Loqoların Boyu (Hündürlüyü)
                  </span>
                  <span className="font-mono font-black text-[#4f533b] bg-[#4f533b]/10 px-2 py-0.5 rounded-md text-xs">
                    {settings.logoHeight || 36} px
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="80"
                  step="2"
                  value={settings.logoHeight || 36}
                  onChange={e => setSettings({ ...settings, logoHeight: Number(e.target.value) })}
                  className="w-full accent-[#4f533b] cursor-pointer"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="text-[10px] text-slate-400">Hazır ölçülər:</span>
                  <div className="flex gap-1.5">
                    {[28, 36, 44, 52, 64].map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSettings({ ...settings, logoHeight: size })}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition cursor-pointer ${
                          (settings.logoHeight || 36) === size
                            ? 'bg-[#4f533b] text-white border-[#4f533b]'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {size}px
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Logo Gap (Məsafə) */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    ↔️ Loqolar Arası Məsafə (Aralıq)
                  </span>
                  <span className="font-mono font-black text-[#4f533b] bg-[#4f533b]/10 px-2 py-0.5 rounded-md text-xs">
                    {settings.logoGap !== undefined ? settings.logoGap : 12} px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="48"
                  step="2"
                  value={settings.logoGap !== undefined ? settings.logoGap : 12}
                  onChange={e => setSettings({ ...settings, logoGap: Number(e.target.value) })}
                  className="w-full accent-[#4f533b] cursor-pointer"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="text-[10px] text-slate-400">Hazır aralıqlar:</span>
                  <div className="flex gap-1.5">
                    {[4, 8, 12, 18, 24, 32].map(gapVal => (
                      <button
                        key={gapVal}
                        type="button"
                        onClick={() => setSettings({ ...settings, logoGap: gapVal })}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition cursor-pointer ${
                          (settings.logoGap !== undefined ? settings.logoGap : 12) === gapVal
                            ? 'bg-[#4f533b] text-white border-[#4f533b]'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {gapVal}px
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Storefront Logo Slots */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Slot 1: Primary Logo */}
            <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#4f533b] text-white text-[10px] font-black flex items-center justify-center">1</span>
                  Əsas Loqo (Loqo 1)
                </label>
                {settings.logoUrl && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md font-bold">
                    WebP Aktiv
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="https://... və ya kompüterdən seçin"
                    value={settings.logoUrl}
                    onChange={e => {
                      const val = e.target.value;
                      setSettings(prev => ({
                        ...prev,
                        logoUrl: val,
                        logos: [val, prev.logoUrl2 || '', prev.logoUrl3 || ''].filter(Boolean),
                      }));
                    }}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-[#4f533b] transition"
                  />
                  {settings.logoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setSettings(prev => ({
                          ...prev,
                          logoUrl: '',
                          logos: ['', prev.logoUrl2 || '', prev.logoUrl3 || ''].filter(Boolean),
                        }));
                      }}
                      className="p-2 rounded-xl bg-white text-rose-600 border border-slate-200 hover:bg-rose-50 cursor-pointer shadow-2xs"
                      title="Loqo 1-i təmizlə"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-slate-300 hover:border-[#4f533b] bg-white hover:bg-[#f4f5f0] text-slate-700 text-xs font-semibold transition cursor-pointer shadow-2xs">
                  <UploadCloud className="w-4 h-4 text-[#4f533b]" />
                  <span>Loqo 1 Yüklə (WebP)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogo1FileUpload}
                    className="hidden"
                  />
                </label>

                {settings.logoUrl && (
                  <div className="p-2 rounded-xl border border-slate-200 bg-white flex items-center justify-between shadow-2xs">
                    <span className="text-[10px] text-slate-400 font-bold">Önizləmə:</span>
                    <img 
                      src={settings.logoUrl} 
                      alt="Logo 1" 
                      style={{ height: `${settings.logo1Height || settings.logoHeight || 36}px` }}
                      className="w-auto max-w-[140px] object-contain" 
                    />
                  </div>
                )}

                {/* Loqo 1 Xüsusi Boyu */}
                <div className="pt-2 border-t border-slate-200/70 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-slate-700">📏 Loqo 1 Xüsusi Boyu:</span>
                    <span className="font-mono font-black text-[#4f533b] bg-[#4f533b]/10 px-1.5 py-0.5 rounded text-[10px]">
                      {settings.logo1Height || settings.logoHeight || 36} px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="80"
                    step="2"
                    value={settings.logo1Height || settings.logoHeight || 36}
                    onChange={e => setSettings({ ...settings, logo1Height: Number(e.target.value) })}
                    className="w-full accent-[#4f533b] cursor-pointer"
                  />
                  <div className="flex justify-end gap-1 text-[9px]">
                    {[24, 32, 36, 44, 54].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSettings({ ...settings, logo1Height: s })}
                        className={`px-1.5 py-0.5 rounded border ${
                          (settings.logo1Height || settings.logoHeight || 36) === s
                            ? 'bg-[#4f533b] text-white border-[#4f533b]'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        {s}px
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Slot 2: Secondary Logo */}
            <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-700 text-white text-[10px] font-black flex items-center justify-center">2</span>
                  İkinci Loqo (Loqo 2)
                </label>
                {settings.logoUrl2 && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md font-bold">
                    WebP Aktiv
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="https://... və ya kompüterdən seçin"
                    value={settings.logoUrl2 || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setSettings(prev => ({
                        ...prev,
                        logoUrl2: val,
                        logos: [prev.logoUrl || '', val, prev.logoUrl3 || ''].filter(Boolean),
                      }));
                    }}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-[#4f533b] transition"
                  />
                  {settings.logoUrl2 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSettings(prev => ({
                          ...prev,
                          logoUrl2: '',
                          logos: [prev.logoUrl || '', '', prev.logoUrl3 || ''].filter(Boolean),
                        }));
                      }}
                      className="p-2 rounded-xl bg-white text-rose-600 border border-slate-200 hover:bg-rose-50 cursor-pointer shadow-2xs"
                      title="Loqo 2-ni təmizlə"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-slate-300 hover:border-[#4f533b] bg-white hover:bg-[#f4f5f0] text-slate-700 text-xs font-semibold transition cursor-pointer shadow-2xs">
                  <UploadCloud className="w-4 h-4 text-[#4f533b]" />
                  <span>Loqo 2 Yüklə (WebP)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogo2FileUpload}
                    className="hidden"
                  />
                </label>

                {settings.logoUrl2 && (
                  <div className="p-2 rounded-xl border border-slate-200 bg-white flex items-center justify-between shadow-2xs">
                    <span className="text-[10px] text-slate-400 font-bold">Önizləmə:</span>
                    <img 
                      src={settings.logoUrl2} 
                      alt="Logo 2" 
                      style={{ height: `${settings.logo2Height || settings.logoHeight || 36}px` }}
                      className="w-auto max-w-[140px] object-contain" 
                    />
                  </div>
                )}

                {/* Loqo 2 Xüsusi Boyu */}
                <div className="pt-2 border-t border-slate-200/70 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-slate-700">📏 Loqo 2 Xüsusi Boyu:</span>
                    <span className="font-mono font-black text-[#4f533b] bg-[#4f533b]/10 px-1.5 py-0.5 rounded text-[10px]">
                      {settings.logo2Height || settings.logoHeight || 36} px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="80"
                    step="2"
                    value={settings.logo2Height || settings.logoHeight || 36}
                    onChange={e => setSettings({ ...settings, logo2Height: Number(e.target.value) })}
                    className="w-full accent-[#4f533b] cursor-pointer"
                  />
                  <div className="flex justify-end gap-1 text-[9px]">
                    {[24, 32, 36, 44, 54].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSettings({ ...settings, logo2Height: s })}
                        className={`px-1.5 py-0.5 rounded border ${
                          (settings.logo2Height || settings.logoHeight || 36) === s
                            ? 'bg-[#4f533b] text-white border-[#4f533b]'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        {s}px
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Slot 3: Third Logo */}
            <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-700 text-white text-[10px] font-black flex items-center justify-center">3</span>
                  Üçüncü Loqo (Loqo 3)
                </label>
                {settings.logoUrl3 && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md font-bold">
                    WebP Aktiv
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="https://... və ya kompüterdən seçin"
                    value={settings.logoUrl3 || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setSettings(prev => ({
                        ...prev,
                        logoUrl3: val,
                        logos: [prev.logoUrl || '', prev.logoUrl2 || '', val].filter(Boolean),
                      }));
                    }}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-[#4f533b] transition"
                  />
                  {settings.logoUrl3 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSettings(prev => ({
                          ...prev,
                          logoUrl3: '',
                          logos: [prev.logoUrl || '', prev.logoUrl2 || '', ''].filter(Boolean),
                        }));
                      }}
                      className="p-2 rounded-xl bg-white text-rose-600 border border-slate-200 hover:bg-rose-50 cursor-pointer shadow-2xs"
                      title="Loqo 3-ü təmizlə"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-slate-300 hover:border-[#4f533b] bg-white hover:bg-[#f4f5f0] text-slate-700 text-xs font-semibold transition cursor-pointer shadow-2xs">
                  <UploadCloud className="w-4 h-4 text-[#4f533b]" />
                  <span>Loqo 3 Yüklə (WebP)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogo3FileUpload}
                    className="hidden"
                  />
                </label>

                {settings.logoUrl3 && (
                  <div className="p-2 rounded-xl border border-slate-200 bg-white flex items-center justify-between shadow-2xs">
                    <span className="text-[10px] text-slate-400 font-bold">Önizləmə:</span>
                    <img 
                      src={settings.logoUrl3} 
                      alt="Logo 3" 
                      style={{ height: `${settings.logo3Height || settings.logoHeight || 36}px` }}
                      className="w-auto max-w-[140px] object-contain" 
                    />
                  </div>
                )}

                {/* Loqo 3 Xüsusi Boyu */}
                <div className="pt-2 border-t border-slate-200/70 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-slate-700">📏 Loqo 3 Xüsusi Boyu:</span>
                    <span className="font-mono font-black text-[#4f533b] bg-[#4f533b]/10 px-1.5 py-0.5 rounded text-[10px]">
                      {settings.logo3Height || settings.logoHeight || 36} px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="80"
                    step="2"
                    value={settings.logo3Height || settings.logoHeight || 36}
                    onChange={e => setSettings({ ...settings, logo3Height: Number(e.target.value) })}
                    className="w-full accent-[#4f533b] cursor-pointer"
                  />
                  <div className="flex justify-end gap-1 text-[9px]">
                    {[24, 32, 36, 44, 54].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSettings({ ...settings, logo3Height: s })}
                        className={`px-1.5 py-0.5 rounded border ${
                          (settings.logo3Height || settings.logoHeight || 36) === s
                            ? 'bg-[#4f533b] text-white border-[#4f533b]'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        {s}px
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ERP Panel Logo & Titles */}
          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 mb-2">ERP İdarəetmə Paneli Loqosu</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="https://... və ya yükləyin"
                    value={settings.erpLogoUrl}
                    onChange={e => setSettings({ ...settings, erpLogoUrl: e.target.value })}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-[#4f533b] transition"
                  />
                  {settings.erpLogoUrl && (
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, erpLogoUrl: '' })}
                      className="p-2 rounded-xl bg-slate-100 text-rose-600 border border-slate-200 hover:bg-rose-50 cursor-pointer"
                      title="ERP Loqosunu təmizlə"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-slate-300 hover:border-[#4f533b] bg-slate-50 hover:bg-[#f4f5f0] text-slate-700 text-xs font-semibold transition cursor-pointer">
                  <UploadCloud className="w-4 h-4 text-[#4f533b]" />
                  <span>Kompüterdən ERP Paneli Loqosu Yüklə</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleErpLogoFileUpload}
                    className="hidden"
                  />
                </label>

                {settings.erpLogoUrl && (
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">ERP Loqosu:</span>
                    <img src={settings.erpLogoUrl} alt="ERP Logo" className="h-8 max-w-[160px] object-contain" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">ERP Paneli Adı</label>
                  <input
                    type="text"
                    placeholder="Techno ERP"
                    value={settings.erpTitle}
                    onChange={e => setSettings({ ...settings, erpTitle: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-bold outline-none focus:border-[#4f533b]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">ERP Panel Alt Şüarı</label>
                  <input
                    type="text"
                    placeholder="İdarəetmə Paneli"
                    value={settings.erpSubtitle}
                    onChange={e => setSettings({ ...settings, erpSubtitle: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-[#4f533b]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-600 mb-1.5 block">Sayt Şüarı / Tagline</label>
            <input
              type="text"
              value={settings.tagline}
              onChange={e => setSettings({ ...settings, tagline: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-[#4f533b] transition"
            />
          </div>
        </div>

        {/* ── 2. Əsas Tema Rəngi ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <h3 className="text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#4f533b]" /> Saytın Əsas Mövzu Rəngi (Theme Color)
          </h3>

          <div className="space-y-3">
            <label className="text-xs text-slate-600 block">Hazır Rəng Palitrasından Seçin:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {COLOR_PRESETS.map(preset => {
                const isSelected = settings.primaryColor.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => setSettings({ ...settings, primaryColor: preset.hex })}
                    className={`p-2.5 rounded-xl border text-xs flex flex-col items-center gap-2 cursor-pointer transition ${
                      isSelected ? 'border-slate-900 shadow-md ring-2 ring-slate-900/10' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-6 h-6 rounded-full border border-black/10 shadow-xs inline-block" style={{ backgroundColor: preset.hex }} />
                    <span className="text-[10px] text-slate-600 text-center font-medium line-clamp-1">{preset.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex items-center gap-3">
              <label className="text-xs text-slate-600 font-medium">Xüsusi Rəng Seçimi (HEX):</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={e => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={settings.primaryColor}
                  onChange={e => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="w-28 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-800 outline-none focus:border-[#4f533b]"
                />
              </div>
            </div>

            {/* Color Live Preview Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4 mt-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: settings.primaryColor }} />
                <span className="text-xs text-slate-700 font-medium">Seçilmiş rəngin düymə və etiketlərdə görünüşü:</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-xl text-white text-xs font-medium shadow-xs transition"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  Səbətə At
                </button>
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-medium border"
                  style={{
                    backgroundColor: `${settings.primaryColor}15`,
                    color: settings.primaryColor,
                    borderColor: `${settings.primaryColor}30`,
                  }}
                >
                  ✓ Pulsuz Çatdırılma
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. Brauzer Tab İkonu & Mətni ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <h3 className="text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#4f533b]" /> Brauzer Tab İkonu (Favicon) Və Səhifə Başlığı
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-xs text-slate-600 mb-1.5 block">Favicon İkonu (URL və ya Fayl Yüklə)</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="https://.../favicon.ico"
                    value={settings.faviconUrl}
                    onChange={e => setSettings({ ...settings, faviconUrl: e.target.value })}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-[#4f533b] transition"
                  />
                  {settings.faviconUrl && (
                    <img src={settings.faviconUrl} alt="Favicon" className="w-7 h-7 rounded-md object-contain border border-slate-200 p-0.5 flex-shrink-0" />
                  )}
                </div>

                <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-slate-300 hover:border-[#4f533b] bg-slate-50 hover:bg-[#f4f5f0] text-slate-700 text-xs transition cursor-pointer">
                  <UploadCloud className="w-4 h-4 text-[#4f533b]" />
                  <span>Kompüterdən Favicon İkon Yüklə (ICO, PNG, SVG)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFaviconFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-600 mb-1.5 block">Brauzer Tab Mətni (Tab Title)</label>
              <input
                type="text"
                placeholder="TechnoMania — Elektrotexnika və Smartfonlar"
                value={settings.tabTitle}
                onChange={e => setSettings({ ...settings, tabTitle: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-[#4f533b] transition"
              />
              <p className="text-[11px] text-slate-400 mt-1">İstifadəçi saytda olduqda pəncərədə görünən əsas başlıq.</p>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-600 mb-1.5 block">Tab Şüarı / Slogan</label>
            <input
              type="text"
              value={settings.tabSlogan}
              onChange={e => setSettings({ ...settings, tabSlogan: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-[#4f533b] transition"
            />
          </div>

          {/* Browser Tab Preview */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-100 flex items-center gap-3">
            <div className="bg-white border border-slate-300 rounded-t-lg px-3 py-1.5 flex items-center gap-2 text-xs text-slate-800 shadow-xs max-w-xs">
              <img src={settings.faviconUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=64&q=80'} alt="Tab" className="w-3.5 h-3.5 object-contain" />
              <span className="truncate text-[11px] font-medium">{settings.tabTitle || 'TechnoMania'}</span>
            </div>
            <span className="text-[11px] text-slate-500 italic">← Brauzerdə pəncərə tabının nümayiş simulyasiyası</span>
          </div>
        </div>

        {/* ── 4. SEO & OpenGraph Paylaşım ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <h3 className="text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-[#4f533b]" /> SEO Məlumatları Və Sosial Paylaşım (OpenGraph)
          </h3>

          <div>
            <label className="text-xs text-slate-600 mb-1.5 block">Meta Description (Axtarış Sistemləri üçün)</label>
            <textarea
              rows={3}
              value={settings.metaDesc}
              onChange={e => setSettings({ ...settings, metaDesc: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 outline-none focus:border-[#4f533b] transition leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-xs text-slate-600 mb-1.5 block">Meta Axtarış Açar Sözləri (Keywords)</label>
              <input
                type="text"
                placeholder="smartfon, noutbuk, bakı..."
                value={settings.metaKeywords}
                onChange={e => setSettings({ ...settings, metaKeywords: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-[#4f533b] transition"
              />
            </div>

            <div>
              <label className="text-xs text-slate-600 mb-1.5 block">OpenGraph Sosial Paylaşım Şəkli (OG Image URL)</label>
              <input
                type="text"
                placeholder="https://... (WhatsApp-da link atanda görünən şəkil)"
                value={settings.ogImageUrl}
                onChange={e => setSettings({ ...settings, ogImageUrl: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-[#4f533b] transition"
              />
            </div>
          </div>
        </div>

        {/* ── 5. Sosial Şəbəkələr Və Əlaqə Linkləri ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <h3 className="text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#4f533b]" /> Sosial Şəbəkələr Və Əlaqə Linkləri
          </h3>
          <p className="text-xs text-slate-500">
            Veb saytın aşağı hissəsində (Footer) nümayiş olunan sosial media hesablarının rəsmi keçid linklərini daxil edin.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-xs text-slate-600 mb-1 block">Instagram URL</label>
              <input
                type="text"
                placeholder="https://instagram.com/technomania.az"
                value={settings.socialInstagram || ''}
                onChange={e => setSettings({ ...settings, socialInstagram: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-[#4f533b] transition"
              />
            </div>

            <div>
              <label className="text-xs text-slate-600 mb-1 block">Facebook URL</label>
              <input
                type="text"
                placeholder="https://facebook.com/technomania.az"
                value={settings.socialFacebook || ''}
                onChange={e => setSettings({ ...settings, socialFacebook: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-[#4f533b] transition"
              />
            </div>

            <div>
              <label className="text-xs text-slate-600 mb-1 block">TikTok URL</label>
              <input
                type="text"
                placeholder="https://tiktok.com/@technomania.az"
                value={settings.socialTiktok || ''}
                onChange={e => setSettings({ ...settings, socialTiktok: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-[#4f533b] transition"
              />
            </div>

            <div>
              <label className="text-xs text-slate-600 mb-1 block">YouTube URL</label>
              <input
                type="text"
                placeholder="https://youtube.com/@technomania.az"
                value={settings.socialYoutube || ''}
                onChange={e => setSettings({ ...settings, socialYoutube: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-[#4f533b] transition"
              />
            </div>

            <div>
              <label className="text-xs text-slate-600 mb-1 block">WhatsApp Chat URL</label>
              <input
                type="text"
                placeholder="https://wa.me/994502881717"
                value={settings.socialWhatsapp || ''}
                onChange={e => setSettings({ ...settings, socialWhatsapp: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-[#4f533b] transition"
              />
            </div>

            <div>
              <label className="text-xs text-slate-600 mb-1 block">Telegram URL</label>
              <input
                type="text"
                placeholder="https://t.me/technomania_az"
                value={settings.socialTelegram || ''}
                onChange={e => setSettings({ ...settings, socialTelegram: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-[#4f533b] transition"
              />
            </div>
          </div>
        </div>

        {/* ── 6. Əlaqə və Qaynar Xətt Telefon Nömrələri (3 Nömrə) ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <h3 className="text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-[#4f533b]" /> Əlaqə və Qaynar Xətt Nömrələri (3 Nömrə)
          </h3>
          <p className="text-xs text-slate-500">
            <strong>1-ci Nömrə</strong> saytın ən yuxarı zolağında (Top bar) və footer-də əsas qaynar xətt kimi göstərilir. <strong>2-ci və 3-cü nömrələr</strong> isə footer-də əlavə əlaqə kimi nümayiş olunur.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">1. Əsas Qaynar Xətt (Header & Footer) *</label>
              <input
                type="text"
                placeholder="Məs: 171 və ya *6060"
                value={settings.phone1 || ''}
                onChange={e => setSettings({ ...settings, phone1: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-black text-slate-900 outline-none focus:border-[#4f533b] transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">2. Müştəri Xidmətləri (Footer)</label>
              <input
                type="text"
                placeholder="Məs: +994 (12) 310 00 00"
                value={settings.phone2 || ''}
                onChange={e => setSettings({ ...settings, phone2: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-bold text-slate-800 outline-none focus:border-[#4f533b] transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">3. Korporativ / Əlavə Əlaqə (Footer)</label>
              <input
                type="text"
                placeholder="Məs: +994 (50) 288 17 17"
                value={settings.phone3 || ''}
                onChange={e => setSettings({ ...settings, phone3: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-bold text-slate-800 outline-none focus:border-[#4f533b] transition"
              />
            </div>
          </div>
        </div>

        {/* ── 7. Marketinq Skriptləri Və İzləmə Kodları (Pixels, GA4, GTM, Sentry, reCAPTCHA) ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <h3 className="text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#4f533b]" /> Marketinq, Reklam Və İzləmə Skriptləri
          </h3>
          <p className="text-xs text-slate-500">
            TikTok Pixel, Facebook Pixel, Google Analytics, GTM, LinkedIn, Microsoft Ads və Sentry izləmə kodlarını aktiv edin.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">TikTok Pixel ID</label>
              <input
                type="text"
                placeholder="Məs: C9ABC12345"
                value={settings.tiktokPixelId || ''}
                onChange={e => setSettings({ ...settings, tiktokPixelId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono outline-none focus:border-[#4f533b] transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Facebook Pixel ID</label>
              <input
                type="text"
                placeholder="Məs: 123456789012345"
                value={settings.facebookPixelId || ''}
                onChange={e => setSettings({ ...settings, facebookPixelId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono outline-none focus:border-[#4f533b] transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Google Analytics ID (GA4)</label>
              <input
                type="text"
                placeholder="Məs: G-XXXXXXXXXX"
                value={settings.googleAnalyticsId || ''}
                onChange={e => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono outline-none focus:border-[#4f533b] transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Google Tag Manager (GTM)</label>
              <input
                type="text"
                placeholder="Məs: GTM-XXXXXXX"
                value={settings.googleTagManagerId || ''}
                onChange={e => setSettings({ ...settings, googleTagManagerId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono outline-none focus:border-[#4f533b] transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">LinkedIn Insight Tag ID</label>
              <input
                type="text"
                placeholder="Məs: 123456"
                value={settings.linkedinTagId || ''}
                onChange={e => setSettings({ ...settings, linkedinTagId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono outline-none focus:border-[#4f533b] transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Microsoft Ads ID (UET)</label>
              <input
                type="text"
                placeholder="Məs: 12345678"
                value={settings.microsoftAdsId || ''}
                onChange={e => setSettings({ ...settings, microsoftAdsId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono outline-none focus:border-[#4f533b] transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Sentry DSN</label>
              <input
                type="text"
                placeholder="https://...@sentry.io/..."
                value={settings.sentryDsn || ''}
                onChange={e => setSettings({ ...settings, sentryDsn: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono outline-none focus:border-[#4f533b] transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Google reCAPTCHA v3 Key</label>
              <input
                type="text"
                placeholder="6LeIx0cYAAAAA..."
                value={settings.recaptchaSiteKey || ''}
                onChange={e => setSettings({ ...settings, recaptchaSiteKey: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono outline-none focus:border-[#4f533b] transition"
              />
            </div>
          </div>
        </div>

        {/* ── 8. FOOTER DİZAYN VƏ MÜHƏNDİSLİK MÜƏLLİFİ ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-sm font-black text-slate-800 mb-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#4f533b]" /> Footer Dizayn & Mühəndislik Tənzimləməsi
          </h2>
          <p className="text-xs text-slate-500 mb-5">
            Storefront saytının ən aşağı (Footer) hissəsində göstərilən dizayn və mühəndislik müəllifliyi başlığını, icraçı adını və yönləndiriləcək keçid linkini redaktə edin.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">1. Bölmə Başlığı</label>
              <input
                type="text"
                placeholder="Məs: Dizayn və Mühəndislik:"
                value={settings.footerDesignTitle !== undefined ? settings.footerDesignTitle : 'Dizayn və Mühəndislik:'}
                onChange={e => setSettings({ ...settings, footerDesignTitle: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-[#4f533b] transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">2. İcraçı / Cavab Mətni</label>
              <input
                type="text"
                placeholder="Məs: TechnoMania Pro"
                value={settings.footerDesignText !== undefined ? settings.footerDesignText : 'TechnoMania Pro'}
                onChange={e => setSettings({ ...settings, footerDesignText: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#4f533b] outline-none focus:border-[#4f533b] transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">3. Yönləndiriləcək Keçid Linki (URL)</label>
              <input
                type="text"
                placeholder="Məs: https://technomania.az və ya #"
                value={settings.footerDesignLink || ''}
                onChange={e => setSettings({ ...settings, footerDesignLink: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 outline-none focus:border-[#4f533b] transition"
              />
            </div>
          </div>
        </div>

        {/* ── Footer Action Bar ── */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="bg-[#4f533b] hover:bg-[#3e4230] text-white text-sm px-6 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" /> Bütün Dəyişiklikləri Yadda Saxla Və Tətbiq Et
          </button>
        </div>
      </form>
    </div>
  );
}
