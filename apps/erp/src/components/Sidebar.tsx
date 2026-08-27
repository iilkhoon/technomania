'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Image as ImageIcon,
  Search,
  ShoppingCart,
  ChevronDown,
  Users,
  Ticket,
  BarChart3,
  Award,
  Sliders,
  MapPin,
  MessageSquare,
  HelpCircle,
  Percent,
  FileText,
  Megaphone,
  Layout,
  Warehouse,
  Star,
  Flame,
  Crown,
  Store,
  CreditCard,
  Truck,
  DollarSign,
  Receipt,
  UserCheck,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  FileCheck,
  Building2,
  ArrowLeftRight,
  FileSpreadsheet,
  AlertCircle,
  Wallet,
  BadgeCheck,
  Video,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Activity,
  Layers,
  X,
  Smartphone,
} from './HeroIconsHub';
import { showToast } from '../lib/toastStore';

export default function Sidebar() {
  const pathname = usePathname();

  const [pinnedPages, setPinnedPages] = React.useState<Array<{ name: string; href: string }>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('technomania_pinned_pages');
        if (saved) return JSON.parse(saved);
      } catch (e) { }
    }
    return [
      { name: 'Anbar', href: '/inventory' },
      { name: 'Sifarişlər', href: '/orders' },
    ];
  });

  const togglePin = (name: string, href: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let updated: Array<{ name: string; href: string }>;
    if (pinnedPages.some(p => p.href === href)) {
      updated = pinnedPages.filter(p => p.href !== href);
      showToast(`"${name}" sevimlilərdən çıxarıldı`, 'info');
    } else {
      updated = [...pinnedPages, { name, href }];
      showToast(`"${name}" sevimlilərə əlavə olundu ⭐`, 'success');
    }

    setPinnedPages(updated);
    try {
      localStorage.setItem('technomania_pinned_pages', JSON.stringify(updated));
    } catch (e) { }
  };

  const [isOnline, setIsOnline] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') return navigator.onLine;
    return true;
  });

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Dropdown Active States & Toggle Open State
  const isCatalogActive =
    pathname.startsWith('/products') ||
    pathname.startsWith('/categories') ||
    pathname.startsWith('/brands') ||
    pathname.startsWith('/services') ||
    pathname.startsWith('/pricing');
  const [isCatalogOpen, setIsCatalogOpen] = React.useState(true);

  const isCreditActive = pathname.startsWith('/credit');
  const [isCreditOpen, setIsCreditOpen] = React.useState(false);

  const isPurchasesActive = pathname.startsWith('/purchases') || pathname.startsWith('/inventory');
  const [isPurchasesOpen, setIsPurchasesOpen] = React.useState(false);

  const isFinanceActive = pathname.startsWith('/finance');
  const [isFinanceOpen, setIsFinanceOpen] = React.useState(false);

  const isCrmActive = pathname.startsWith('/crm') || pathname.startsWith('/customers') || pathname.startsWith('/employees');
  const [isCrmOpen, setIsCrmOpen] = React.useState(false);

  const isMarketingActive =
    pathname.startsWith('/homepage-settings') ||
    pathname.startsWith('/weekly-offers') ||
    pathname.startsWith('/videos') ||
    pathname.startsWith('/marketing') ||
    pathname.startsWith('/affiliates') ||
    pathname.startsWith('/coupons') ||
    pathname.startsWith('/reviews') ||
    pathname.startsWith('/faqs') ||
    pathname.startsWith('/seo') ||
    pathname.startsWith('/analytics') ||
    pathname.startsWith('/promos') ||
    pathname.startsWith('/blog') ||
    pathname.startsWith('/stores') ||
    pathname.startsWith('/banners') ||
    pathname.startsWith('/privileges');
  const [isMarketingOpen, setIsMarketingOpen] = React.useState(false);

  const isLegalActive = pathname.startsWith('/legal');
  const [isLegalOpen, setIsLegalOpen] = React.useState(false);

  const [siteSettings, setSiteSettings] = React.useState<{
    logoUrl?: string;
    erpLogoUrl?: string;
    erpTitle?: string;
    erpSubtitle?: string;
    logoTextPrimary?: string;
    logoTextAccent?: string;
    primaryColor?: string;
    faviconUrl?: string;
  }>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('technomania_site_settings');
        if (saved) return JSON.parse(saved);
      } catch (e) { }
    }
    return {};
  });

  React.useEffect(() => {
    const loadSettings = () => {
      fetch('/api/catalog/settings', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
        .then(r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then(data => {
          if (
            data &&
            typeof data === 'object' &&
            !Array.isArray(data) &&
            !data.statusCode &&
            Object.keys(data).length > 0
          ) {
            setSiteSettings(data);
            try {
              localStorage.setItem('technomania_site_settings', JSON.stringify(data));
            } catch (e) { }
          }
        })
        .catch(() => {
          try {
            const saved = localStorage.getItem('technomania_site_settings');
            if (saved) setSiteSettings(JSON.parse(saved));
          } catch (e) { }
        });
    };

    loadSettings();
    window.addEventListener('techno_settings_updated', loadSettings);
    window.addEventListener('storage', loadSettings);
    return () => {
      window.removeEventListener('techno_settings_updated', loadSettings);
      window.removeEventListener('storage', loadSettings);
    };
  }, []);

  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const handleToggle = () => setIsMobileOpen(prev => !prev);
    const handleClose = () => setIsMobileOpen(false);

    window.addEventListener('techno_toggle_mobile_sidebar', handleToggle);
    window.addEventListener('techno_close_mobile_sidebar', handleClose);
    return () => {
      window.removeEventListener('techno_toggle_mobile_sidebar', handleToggle);
      window.removeEventListener('techno_close_mobile_sidebar', handleClose);
    };
  }, []);

  React.useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const bgColor = siteSettings.primaryColor || '#4f533b';
  // Strictly prioritize user uploaded logo
  const logoToShow = siteSettings.erpLogoUrl || siteSettings.logoUrl || siteSettings.faviconUrl;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`w-72 fixed inset-y-0 left-0 z-50 lg:static lg:z-auto h-screen overflow-y-auto border-r border-black/15 flex flex-col flex-shrink-0 text-white select-none shadow-2xl transition-transform duration-300 ease-in-out scrollbar-thin ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ backgroundColor: bgColor }}
      >
        {/* ── Brand Header (STRICTLY USER UPLOADED LOGO) ── */}
        <div className="h-16 border-b border-white/10 px-4 flex items-center justify-between bg-black/15 backdrop-blur-md flex-shrink-0">
          <Link href="/" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 min-w-0 group flex-1">
            {logoToShow ? (
              <img
                src={logoToShow}
                alt="Logo"
                className="h-10 max-h-10 max-w-[150px] object-contain flex-shrink-0 group-hover:scale-105 transition-transform"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center font-black text-sm flex-shrink-0 border border-white/20">
                  {siteSettings.erpTitle ? siteSettings.erpTitle.charAt(0) : 'T'}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate leading-tight">
                    {siteSettings.erpTitle || 'Techno ERP'}
                  </span>
                  <span className="text-[10px] font-medium text-amber-200/80 block truncate">
                    İdarəetmə paneli
                  </span>
                </div>
              </div>
            )}
          </Link>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer ml-2 flex items-center justify-center"
            title="Menyunu bağla"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Menu Navigation Items ── */}
        <div className="flex-1 py-3 px-3 space-y-3.5 overflow-y-auto sidebar-scroll">

          {/* 0. SEVİMLİLƏRİM (PINNED FAVORITES) */}
          {pinnedPages.length > 0 && (
            <div className="space-y-1 bg-black/20 rounded-2xl p-2 border border-white/10 shadow-xs">
              <div className="px-2.5 pb-1 text-[11px] font-bold text-amber-300/90 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>Sevimlilərim</span>
              </div>
              {pinnedPages.map(p => (
                <Link
                  key={p.href}
                  href={p.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all group ${
                    pathname === p.href || pathname.startsWith(p.href)
                      ? 'bg-white/25 text-white font-bold shadow-xs border border-white/20'
                      : 'text-white/85 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="truncate">{p.name}</span>
                  <button
                    type="button"
                    onClick={(e) => togglePin(p.name, p.href, e)}
                    className="opacity-70 group-hover:opacity-100 hover:text-amber-300 transition-opacity p-0.5 cursor-pointer"
                    title="Sevimlilərdən çıxart"
                  >
                    <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                  </button>
                </Link>
              ))}
            </div>
          )}

          {/* 1. RƏHBƏRLİK VƏ İCMAL */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-bold text-amber-300/90">
              Rəhbərlik və icmal
            </div>

            <Link
              href="/executive"
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-[0.98] ${
                pathname === '/executive'
                  ? 'bg-gradient-to-r from-amber-500/30 to-amber-600/30 text-white font-bold shadow-xs border border-amber-300/40'
                  : 'bg-amber-400/15 text-amber-200 hover:bg-amber-400/25 border border-amber-300/25'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-[17px] h-[17px] text-amber-300 flex-shrink-0 animate-pulse" />
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold tracking-wide">Techno AI</span>
                  <span className="text-[9px] bg-amber-400/30 text-amber-200 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">3.6 Flash</span>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            </Link>

            <Link
              href="/"
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-[0.98] ${
                pathname === '/'
                  ? 'bg-white/25 text-white font-bold shadow-xs border border-white/25'
                  : 'text-white/85 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-[17px] h-[17px] text-amber-300 flex-shrink-0" />
                <span>Dashboard</span>
              </div>
              {pathname === '/' && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
            </Link>

            {/* POS (Daxili Satış) */}
            <Link
              href="/pos"
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-[0.98] ${
                pathname === '/pos'
                  ? 'bg-white/25 text-white font-bold shadow-xs border border-white/25'
                  : 'text-white/85 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Store className="w-[17px] h-[17px] text-emerald-300 flex-shrink-0" />
                <span>POS kassa ekranı</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-200 border border-emerald-300/30">
                Kassa
              </span>
            </Link>

            {/* Medya Qalereyası */}
            <Link
              href="/media"
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-[0.98] ${
                pathname === '/media'
                  ? 'bg-white/25 text-white font-bold shadow-xs border border-white/25'
                  : 'text-white/85 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <ImageIcon className="w-[17px] h-[17px] text-sky-300 flex-shrink-0" />
                <span>Mediya qalereyası</span>
              </div>
              {pathname === '/media' && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
            </Link>
          </div>

          {/* 2. KREDİT İDARƏETMƏSİ */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-bold text-amber-300/90">
              Kredit idarəetməsi
            </div>

            <button
              type="button"
              onClick={() => setIsCreditOpen(!isCreditOpen)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isCreditActive
                  ? 'bg-white/20 text-white font-bold shadow-xs border border-white/25'
                  : 'text-white/85 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className={`w-[17px] h-[17px] ${isCreditActive ? 'text-amber-300' : 'text-white/80'}`} />
                <span>Kredit əməliyyatları</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-white/80 transition-transform duration-250 ${isCreditOpen ? 'rotate-180 text-amber-300' : 'rotate-0'}`} />
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCreditOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="pl-3 py-1 space-y-0.5 border-l-2 border-white/15 ml-4">
                <Link href="/credit/overdue" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname === '/credit/overdue' ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-3.5 h-3.5 text-rose-300" />
                    <span>Gecikən ödənişlər</span>
                  </div>
                </Link>
                <Link href="/credit/list" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname === '/credit/list' ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-3.5 h-3.5 text-amber-200" />
                    <span>Kreditlərin siyahısı</span>
                  </div>
                </Link>
                <Link href="/credit/customers" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname === '/credit/customers' ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Kreditli müştərilər</span>
                  </div>
                </Link>
                <Link href="/credit/terms" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname === '/credit/terms' ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <FileCheck className="w-3.5 h-3.5 text-sky-200" />
                    <span>Kredit şərtləri</span>
                  </div>
                </Link>
                <Link href="/credit/contracts" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname === '/credit/contracts' ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-3.5 h-3.5 text-purple-200" />
                    <span>Müqavilələr</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* 3. SATIŞ VƏ SİFARİŞLƏR */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-bold text-amber-300/90">
              Satış və sifarişlər
            </div>
            <Link
              href="/orders"
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-[0.98] ${
                pathname.startsWith('/orders')
                  ? 'bg-white/25 text-white font-bold shadow-xs border border-white/25'
                  : 'text-white/85 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-[17px] h-[17px] text-amber-300 flex-shrink-0" />
                <span>Bütün sifarişlər</span>
              </div>
              {pathname.startsWith('/orders') && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
            </Link>
          </div>

          {/* 4. ALIŞ VƏ ANBAR */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-bold text-amber-300/90">
              Alış və anbar
            </div>

            <button
              type="button"
              onClick={() => setIsPurchasesOpen(!isPurchasesOpen)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isPurchasesActive
                  ? 'bg-white/20 text-white font-bold shadow-xs border border-white/25'
                  : 'text-white/85 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Truck className={`w-[17px] h-[17px] ${isPurchasesActive ? 'text-amber-300' : 'text-white/80'}`} />
                <span>Alış və anbar</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-white/80 transition-transform duration-250 ${isPurchasesOpen ? 'rotate-180 text-amber-300' : 'rotate-0'}`} />
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isPurchasesOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="pl-3 py-1 space-y-0.5 border-l-2 border-white/15 ml-4">
                <Link href="/purchases/invoices" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname === '/purchases/invoices' ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <Receipt className="w-3.5 h-3.5 text-amber-200" />
                    <span>Alış qaimələri</span>
                  </div>
                </Link>
                <Link href="/purchases/suppliers" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname === '/purchases/suppliers' ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-3.5 h-3.5 text-sky-200" />
                    <span>Təchizatçılar</span>
                  </div>
                </Link>
                <Link href="/purchases/transfers" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname === '/purchases/transfers' ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Anbar transferləri</span>
                  </div>
                </Link>
                <Link href="/inventory" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname.startsWith('/inventory') ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <Warehouse className="w-3.5 h-3.5 text-amber-300" />
                    <span>Anbar qalığı (Canlı)</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* 5. MALİYYƏ VƏ KASSA */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-bold text-amber-300/90">
              Maliyyə və kassa
            </div>

            <button
              type="button"
              onClick={() => setIsFinanceOpen(!isFinanceOpen)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isFinanceActive
                  ? 'bg-white/20 text-white font-bold shadow-xs border border-white/25'
                  : 'text-white/85 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Receipt className={`w-[17px] h-[17px] ${isFinanceActive ? 'text-amber-300' : 'text-white/80'}`} />
                <span>Maliyyə hesabatları</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-white/80 transition-transform duration-250 ${isFinanceOpen ? 'rotate-180 text-amber-300' : 'rotate-0'}`} />
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isFinanceOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="pl-3 py-1 space-y-0.5 border-l-2 border-white/15 ml-4">
                <Link href="/finance/expenses" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname === '/finance/expenses' ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <TrendingDown className="w-3.5 h-3.5 text-rose-300" />
                    <span>Kassa xərcləri</span>
                  </div>
                </Link>
                <Link href="/finance/profit" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname === '/finance/profit' ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Mənfəət hesabatı</span>
                  </div>
                </Link>
                <Link href="/finance/z-reports" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname === '/finance/z-reports' ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-amber-200" />
                    <span>Z hesabatları</span>
                  </div>
                </Link>
                <Link href="/finance/credit-reports" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname === '/finance/credit-reports' ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-3.5 h-3.5 text-sky-200" />
                    <span>Kredit hesabatları</span>
                  </div>
                </Link>
                <Link href="/finance/loss-reports" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname === '/finance/loss-reports' ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-300" />
                    <span>Zərər hesabatı</span>
                  </div>
                </Link>
                <Link href="/finance/salaries" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname === '/finance/salaries' ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <Wallet className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Maaş hesabatı</span>
                  </div>
                </Link>
                <Link href="/finance/store-reports" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname === '/finance/store-reports' ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <Store className="w-3.5 h-3.5 text-purple-200" />
                    <span>Mağaza hesabatları</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* 6. CRM VƏ MÜŞTƏRİLƏR */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-bold text-amber-300/90">
              CRM və istifadəçilər
            </div>

            <button
              type="button"
              onClick={() => setIsCrmOpen(!isCrmOpen)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isCrmActive
                  ? 'bg-white/20 text-white font-bold shadow-xs border border-white/25'
                  : 'text-white/85 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className={`w-[17px] h-[17px] ${isCrmActive ? 'text-amber-300' : 'text-white/80'}`} />
                <span>Müştərilər və əməkdaşlar</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-white/80 transition-transform duration-250 ${isCrmOpen ? 'rotate-180 text-amber-300' : 'rotate-0'}`} />
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCrmOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="pl-3 py-1 space-y-0.5 border-l-2 border-white/15 ml-4">
                <Link href="/customers" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname === '/customers' ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <Users className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Müştərilər bazası</span>
                  </div>
                </Link>
                <Link href="/crm/seller-reports" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname === '/crm/seller-reports' ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <BarChart3 className="w-3.5 h-3.5 text-amber-200" />
                    <span>Satıcı hesabatı</span>
                  </div>
                </Link>
                <Link href="/crm/sellers" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname === '/crm/sellers' ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <BadgeCheck className="w-3.5 h-3.5 text-sky-200" />
                    <span>Satıcıların siyahısı</span>
                  </div>
                </Link>
                <Link href="/crm/employees" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname === '/crm/employees' ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="w-3.5 h-3.5 text-purple-200" />
                    <span>Əməkdaşların siyahısı</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* 7. KATALOQ İDARƏETMƏSİ */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-bold text-amber-300/90">
              Kataloq idarəetməsi
            </div>

            <button
              type="button"
              onClick={() => setIsCatalogOpen(!isCatalogOpen)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isCatalogActive
                  ? 'bg-white/20 text-white font-bold shadow-xs border border-white/25'
                  : 'text-white/85 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className={`w-[17px] h-[17px] ${isCatalogActive ? 'text-amber-300' : 'text-white/80'}`} />
                <span>Məhsullar və bölmələr</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-white/80 transition-transform duration-250 ${isCatalogOpen ? 'rotate-180 text-amber-300' : 'rotate-0'}`} />
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCatalogOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="pl-3 py-1 space-y-0.5 border-l-2 border-white/15 ml-4">
                <Link href="/products" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname.startsWith('/products') ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <Package className="w-3.5 h-3.5 text-amber-200" />
                    <span>Bütün məhsullar</span>
                  </div>
                </Link>

                <Link href="/categories" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname.startsWith('/categories') ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <FolderTree className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Kateqoriyalar</span>
                  </div>
                </Link>

                <Link href="/brands" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname.startsWith('/brands') ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <Award className="w-3.5 h-3.5 text-sky-200" />
                    <span>Brendlər</span>
                  </div>
                </Link>

                <Link href="/pricing" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname.startsWith('/pricing') ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <Percent className="w-3.5 h-3.5 text-amber-200" />
                    <span>Toplu qiymət və endirimlər</span>
                  </div>
                </Link>

                <Link href="/services" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname.startsWith('/services') ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-200" />
                    <span>Xidmətlər</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* 8. MARKETİNQ VƏ VİTRİN */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-bold text-amber-300/90">
              Marketinq və vitrin
            </div>

            <button
              type="button"
              onClick={() => setIsMarketingOpen(!isMarketingOpen)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isMarketingActive
                  ? 'bg-white/20 text-white font-bold shadow-xs border border-white/25'
                  : 'text-white/85 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Megaphone className={`w-[17px] h-[17px] ${isMarketingActive ? 'text-amber-300' : 'text-white/80'}`} />
                <span>Marketinq alətləri</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-white/80 transition-transform duration-250 ${isMarketingOpen ? 'rotate-180 text-amber-300' : 'rotate-0'}`} />
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isMarketingOpen ? 'max-h-[850px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="pl-3 py-1 space-y-0.5 border-l-2 border-white/15 ml-4">
                <Link href="/marketing/notifications" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname.startsWith('/marketing/notifications') ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <Megaphone className="w-3.5 h-3.5 text-amber-300" />
                    <span>Müştəri bildirişləri</span>
                  </div>
                </Link>

                <Link href="/marketing/stories" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname.startsWith('/marketing/stories') || pathname.startsWith('/marketing/mobile-stories') || pathname.startsWith('/marketing/mobile-app') ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-3.5 h-3.5 text-amber-300" />
                    <span>Mobil tətbiq hekayələri</span>
                  </div>
                </Link>

                <Link href="/privileges" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname.startsWith('/privileges') ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <Award className="w-3.5 h-3.5 text-amber-200" />
                    <span>VIP imtiyazlar</span>
                  </div>
                </Link>

                <Link href="/marketing/homepage-layout" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname.startsWith('/marketing/homepage-layout') ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <Layout className="w-3.5 h-3.5 text-amber-300" />
                    <span>Ana səhifə görünüşü</span>
                  </div>
                </Link>

                <Link href="/marketing/badges" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname.startsWith('/marketing/badges') ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Üstünlük badgeləri</span>
                  </div>
                </Link>

                <Link href="/marketing/news" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname.startsWith('/marketing/news') ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-300" />
                    <span>Xəbərlər və bloq</span>
                  </div>
                </Link>

                <Link href="/marketing/subscribers" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname.startsWith('/marketing/subscribers') ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <Users className="w-3.5 h-3.5 text-sky-300" />
                    <span>Email abunəçilər</span>
                  </div>
                </Link>

                <Link href="/videos" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname.startsWith('/videos') || pathname.startsWith('/marketing/videos') ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <Video className="w-3.5 h-3.5 text-rose-400" />
                    <span>YouTube video icmallar</span>
                  </div>
                </Link>

                <Link href="/weekly-offers" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname.startsWith('/weekly-offers') ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <Flame className="w-3.5 h-3.5 text-rose-300 animate-pulse" />
                    <span>Həftənin təklifləri</span>
                  </div>
                </Link>

                <Link href="/affiliates" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname.startsWith('/affiliates') ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <Users className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Affiliate satış</span>
                  </div>
                </Link>

                <Link href="/reviews" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname.startsWith('/reviews') ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-200" />
                    <span>Müştəri rəyləri</span>
                  </div>
                </Link>

                <Link href="/faqs" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname.startsWith('/faqs') ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <HelpCircle className="w-3.5 h-3.5 text-sky-200" />
                    <span>Suallar və cavablar</span>
                  </div>
                </Link>

                <Link href="/coupons" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname.startsWith('/coupons') ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <Ticket className="w-3.5 h-3.5 text-amber-300" />
                    <span>Kampaniyalar</span>
                  </div>
                </Link>

                <Link href="/seo" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname.startsWith('/seo') ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <Search className="w-3.5 h-3.5 text-emerald-200" />
                    <span>SEO ayarları</span>
                  </div>
                </Link>

                <Link href="/analytics" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname.startsWith('/analytics') ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <BarChart3 className="w-3.5 h-3.5 text-purple-200" />
                    <span>Analitika və dövriyyə</span>
                  </div>
                </Link>

                <Link href="/promos" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname.startsWith('/promos') ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <Percent className="w-3.5 h-3.5 text-rose-200" />
                    <span>Kuponlar</span>
                  </div>
                </Link>

                <Link href="/stores" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname.startsWith('/stores') ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-200" />
                    <span>Mağazalar və filiallar</span>
                  </div>
                </Link>

                <Link href="/banners" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname.startsWith('/banners') ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-200" />
                    <span>Bannerlər və slaydlar</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* 9. HÜQUQ VƏ SƏNƏDLƏR */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-bold text-amber-300/90">
              Hüquq və sənədlər
            </div>

            <button
              type="button"
              onClick={() => setIsLegalOpen(!isLegalOpen)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isLegalActive
                  ? 'bg-white/20 text-white font-bold shadow-xs border border-white/25'
                  : 'text-white/85 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileCheck className={`w-[17px] h-[17px] ${isLegalActive ? 'text-amber-300' : 'text-white/80'}`} />
                <span>Hüquq və siyasət</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-white/80 transition-transform duration-250 ${isLegalOpen ? 'rotate-180 text-amber-300' : 'rotate-0'}`} />
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isLegalOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="pl-3 py-1 space-y-0.5 border-l-2 border-white/15 ml-4">
                <Link href="/legal/contracts" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname === '/legal/contracts' ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Müqavilələr və şablonlar</span>
                  </div>
                </Link>

                <Link href="/legal/privacy" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname === '/legal/privacy' ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <FileCheck className="w-3.5 h-3.5 text-sky-200" />
                    <span>Məxfilik siyasəti</span>
                  </div>
                </Link>

                <Link href="/legal/terms" className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${pathname === '/legal/terms' ? 'bg-white/22 text-white font-bold shadow-2xs' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <div className="flex items-center gap-2.5">
                    <BadgeCheck className="w-3.5 h-3.5 text-amber-200" />
                    <span>İstifadəçi razılaşması</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* 10. TƏHLÜKƏSİZLİK VƏ AUDİT JURNALI */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-bold text-amber-300/90">
              Təhlükəsizlik və nəzarət
            </div>
            <Link
              href="/audit-logs"
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-[0.98] ${
                pathname.startsWith('/audit-logs')
                  ? 'bg-white/25 text-white font-bold shadow-xs border border-white/25'
                  : 'text-white/85 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-[17px] h-[17px] text-amber-300 flex-shrink-0" />
                <span>Audit jurnalı</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-300/30">
                Log
              </span>
            </Link>
          </div>

          {/* 11. SAYT AYARLARI */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-bold text-amber-300/90">
              Sistem və ayarlar
            </div>
            <Link
              href="/settings"
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-[0.98] ${
                pathname.startsWith('/settings')
                  ? 'bg-white/25 text-white font-bold shadow-xs border border-white/25'
                  : 'text-white/85 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sliders className="w-[17px] h-[17px] text-amber-300 flex-shrink-0" />
                <span>Sayt ayarları və vizuallar</span>
              </div>
              {pathname.startsWith('/settings') && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
            </Link>
          </div>

        </div>

      </aside>
    </>
  );
}
