'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Truck,
  CreditCard,
  RotateCcw,
  Sparkles,
  Send,
  CheckCircle2,
  ChevronRight,
  Headphones,
  Smartphone,
  Check,
} from './HeroIconsHub';

interface FooterProps {
  isDarkMode?: boolean;
}

export default function Footer({ isDarkMode = false }: FooterProps) {
  const [settings, setSettings] = useState<any>({});
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const footerLogos: string[] = React.useMemo(() => {
    if (Array.isArray(settings.logos) && settings.logos.length > 0) {
      return settings.logos.filter(Boolean);
    }
    const list = [settings.logoUrl, settings.logoUrl2, settings.logoUrl3].filter(Boolean);
    if (list.length > 0) return list;
    if (settings.erpLogoUrl) return [settings.erpLogoUrl];
    return [];
  }, [settings]);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).__SERVER_SITE_SETTINGS__) {
      setSettings((window as any).__SERVER_SITE_SETTINGS__);
    }
    fetch('/api/catalog/settings', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
      .then(r => r.json())
      .then(data => {
        if (data && typeof data === 'object' && !data.statusCode) {
          setSettings(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setLoading(true);
    try {
      await fetch('/api/catalog/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      }).catch(() => {});
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const phone1 = settings.phone1 || settings.phone || '171';
  const phone2 = settings.phone2 || '+994 (12) 310 00 00';

  return (
    <footer className={`border-t transition-colors mt-12 ${
      isDarkMode ? 'bg-[#0b0f19] border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-600'
    }`}>
      {/* ═══ 1. TOP GUARANTEE / TRUST STRIP ═══ */}
      <div className={`border-b ${isDarkMode ? 'border-slate-800/80 bg-slate-900/40' : 'border-slate-100 bg-[#f8fafc]'}`}>
        <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="flex items-center gap-4 p-3 rounded-2xl transition-colors hover:bg-slate-100/60 dark:hover:bg-slate-800/40">
            <div className="w-12 h-12 rounded-2xl bg-[#4f533b]/10 dark:bg-slate-800 text-[#4f533b] dark:text-[#a3a886] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-black text-sm text-slate-900 dark:text-white">Pulsuz Çatdırılma</h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Bütün sifarişlərə sürətli çatdırılma</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 rounded-2xl transition-colors hover:bg-slate-100/60 dark:hover:bg-slate-800/40">
            <div className="w-12 h-12 rounded-2xl bg-[#4f533b]/10 dark:bg-slate-800 text-[#4f533b] dark:text-[#a3a886] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-black text-sm text-slate-900 dark:text-white">100% Rəsmi Zəmanət</h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Yalnız rəsmi istehsalçı zəmanəti</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 rounded-2xl transition-colors hover:bg-slate-100/60 dark:hover:bg-slate-800/40">
            <div className="w-12 h-12 rounded-2xl bg-[#4f533b]/10 dark:bg-slate-800 text-[#4f533b] dark:text-[#a3a886] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-black text-sm text-slate-900 dark:text-white">0% İlkin Ödəniş</h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">18 ayadək komissiyasız taksit</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 rounded-2xl transition-colors hover:bg-slate-100/60 dark:hover:bg-slate-800/40">
            <div className="w-12 h-12 rounded-2xl bg-[#4f533b]/10 dark:bg-slate-800 text-[#4f533b] dark:text-[#a3a886] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-black text-sm text-slate-900 dark:text-white">14 Gün Geri Qaytarma</h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Şərtsiz dəyişdirmə imkanı</p>
            </div>
          </div>

        </div>
      </div>

      {/* ═══ 2. MAIN FOOTER CONTENT ═══ */}
      <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        
        {/* Col 1: Brand & Contact Info (2 Cols wide on desktop) */}
        <div className="space-y-5 lg:col-span-2 pr-0 lg:pr-6">
          <div 
            className="flex items-center flex-wrap transition-all duration-150"
            style={{ gap: `${settings.logoGap !== undefined ? settings.logoGap : 12}px` }}
          >
            {footerLogos.length > 0 ? (
              footerLogos.map((logoSrc: string, idx: number) => {
                const itemHeight = idx === 0 ? (settings.logo1Height || settings.logoHeight || 36) : idx === 1 ? (settings.logo2Height || settings.logoHeight || 36) : (settings.logo3Height || settings.logoHeight || 36);
                return (
                  <img
                    key={idx}
                    src={logoSrc}
                    alt={`TechnoMania ${idx + 1}`}
                    style={{
                      height: `${itemHeight}px`,
                      maxHeight: '90px'
                    }}
                    className="w-auto object-contain max-w-[160px] sm:max-w-[240px] transition-all duration-200 hover:scale-105"
                    onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                  />
                );
              })
            ) : (
              <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Techno<span className="text-[#4f533b] dark:text-[#a3a886]">Mania</span>
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md font-medium">
            {settings.metaDesc || 'Azərbaycanın qabaqcıl elektronika və rəqəmsal texnika mağazalar şəbəkəsi. Smartfonlar, noutbuklar, məişət texnikası və aksesuarlar ən sərfəli şərtlərlə.'}
          </p>

          {/* Contact Numbers & Hours */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#4f533b] text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-[#4f533b]/20">
                <Phone className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Qaynar xətt</span>
                <a href={`tel:${phone1.replace(/\s+/g, '')}`} className="text-base font-black text-slate-900 dark:text-white hover:text-[#4f533b] transition">
                  {phone1}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3.5 text-xs text-slate-500 dark:text-slate-400">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">İş saatları</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Hər gün: 09:00 — 21:00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Col 2: Populyar Kateqoriyalar */}
        <div className="space-y-4 text-xs">
          <h4 className="font-black text-sm text-slate-900 dark:text-white tracking-wide">
            Populyar Kateqoriyalar
          </h4>
          <ul className="space-y-2.5 font-medium text-slate-600 dark:text-slate-400">
            <li>
              <Link href="/category/smartphones" className="hover:text-[#4f533b] dark:hover:text-[#a3a886] transition flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-[#4f533b]" />
                <span>Smartfonlar və Qadcetlər</span>
              </Link>
            </li>
            <li>
              <Link href="/category/laptops-pc" className="hover:text-[#4f533b] dark:hover:text-[#a3a886] transition flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-[#4f533b]" />
                <span>Noutbuk və Kompüterlər</span>
              </Link>
            </li>
            <li>
              <Link href="/category/tv-audio" className="hover:text-[#4f533b] dark:hover:text-[#a3a886] transition flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-[#4f533b]" />
                <span>Televizor və Audio Texnika</span>
              </Link>
            </li>
            <li>
              <Link href="/category/big-appliances" className="hover:text-[#4f533b] dark:hover:text-[#a3a886] transition flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-[#4f533b]" />
                <span>Böyük Məişət Texnikası</span>
              </Link>
            </li>
            <li>
              <Link href="/category/gaming-consoles" className="hover:text-[#4f533b] dark:hover:text-[#a3a886] transition flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-[#4f533b]" />
                <span>Oyun Konsolları & Gaming</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Müştəri Xidmətləri & Şirkət */}
        <div className="space-y-4 text-xs">
          <h4 className="font-black text-sm text-slate-900 dark:text-white tracking-wide">
            Müştəri Xidmətləri
          </h4>
          <ul className="space-y-2.5 font-medium text-slate-600 dark:text-slate-400">
            <li>
              <Link href="/weekly-offers" className="hover:text-[#4f533b] dark:hover:text-[#a3a886] transition flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-[#4f533b]" />
                <span>Həftənin Təklifləri</span>
              </Link>
            </li>
            <li>
              <Link href="/compare" className="hover:text-[#4f533b] dark:hover:text-[#a3a886] transition flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-[#4f533b]" />
                <span>Məhsul Müqayisəsi</span>
              </Link>
            </li>
            <li>
              <Link href="/wishlist" className="hover:text-[#4f533b] dark:hover:text-[#a3a886] transition flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-[#4f533b]" />
                <span>Seçilmiş Məhsullar</span>
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-[#4f533b] dark:hover:text-[#a3a886] transition flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-[#4f533b]" />
                <span>Səbət və Sifariş</span>
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-[#4f533b] dark:hover:text-[#a3a886] transition flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-[#4f533b]" />
                <span>Şəxsi Kabinet</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Newsletter & Taksit Kartları */}
        <div className="space-y-4 text-xs">
          <h4 className="font-black text-sm text-slate-900 dark:text-white tracking-wide">
            Yeniliklərdən Xəbərdar Ol
          </h4>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Xüsusi kampaniyalar və endirimlərdən ilk siz yararlanın.
          </p>

          <form onSubmit={handleSubscribe} className="space-y-2">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-poçt ünvanınız"
                required
                className={`w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none transition pr-10 ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-[#a3a886]'
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-[#4f533b]'
                }`}
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-[#4f533b] text-white hover:bg-[#3e4230] transition cursor-pointer"
              >
                {loading ? <span className="animate-spin text-xs">⏳</span> : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>
            {subscribed && (
              <p className="text-emerald-600 dark:text-emerald-400 text-[11px] font-bold flex items-center gap-1 animate-fadeIn">
                <Check className="w-3.5 h-3.5" /> Uğurla abunə oldunuz!
              </p>
            )}
          </form>

        </div>

      </div>

      {/* ═══ 3. SOCIAL MEDIA STRIP ═══ */}
      <div className={`border-t py-4 ${isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-slate-50/60'}`}>
        <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500 dark:text-slate-400">Bizi izləyin:</span>
            <div className="flex items-center gap-2">
              <a
                href={settings.socialInstagram || 'https://instagram.com'}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:text-[#4f533b] dark:hover:text-[#a3a886] hover:bg-slate-200/60 dark:hover:bg-slate-800 font-bold transition"
              >
                Instagram
              </a>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <a
                href={settings.socialTiktok || 'https://tiktok.com'}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:text-[#4f533b] dark:hover:text-[#a3a886] hover:bg-slate-200/60 dark:hover:bg-slate-800 font-bold transition"
              >
                TikTok
              </a>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <a
                href={settings.socialYoutube || 'https://youtube.com'}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:text-[#4f533b] dark:hover:text-[#a3a886] hover:bg-slate-200/60 dark:hover:bg-slate-800 font-bold transition"
              >
                YouTube
              </a>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <a
                href={settings.socialFacebook || 'https://facebook.com'}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:text-[#4f533b] dark:hover:text-[#a3a886] hover:bg-slate-200/60 dark:hover:bg-slate-800 font-bold transition"
              >
                Facebook
              </a>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Hər gün 09:00 — 21:00 xidmətinizdəyik
          </span>
        </div>
      </div>

      {/* ═══ 4. COPYRIGHT ═══ */}
      <div className={`border-t py-4 text-center text-[11px] text-slate-400 ${
        isDarkMode ? 'border-slate-800/80 bg-[#070b12]' : 'border-slate-100 bg-slate-50'
      }`}>
        <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} {settings.companyName || 'TechnoMania'}. Bütün hüquqlar qorunur.</span>
          <span>
            {settings.footerDesignTitle || 'Dizayn və Mühəndislik:'}{' '}
            {settings.footerDesignLink ? (
              <a
                href={settings.footerDesignLink}
                target={settings.footerDesignLink.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="font-bold text-[#4f533b] dark:text-[#a3a886] hover:underline cursor-pointer"
              >
                {settings.footerDesignText || 'TechnoMania Pro'}
              </a>
            ) : (
              <strong className="text-[#4f533b] dark:text-[#a3a886]">
                {settings.footerDesignText || 'TechnoMania Pro'}
              </strong>
            )}
          </span>
        </div>
      </div>
    </footer>
  );
}
