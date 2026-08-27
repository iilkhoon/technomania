'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search, Bell, ExternalLink, ChevronRight, ChevronDown, Command,
  User, Key, LogOut, X, Check, Package, ShoppingCart,
  FolderTree, AlertTriangle, ShieldCheck, ArrowRight,
  LayoutDashboard, Warehouse, Megaphone, Users, MessageSquare,
  HelpCircle, Ticket, BarChart3, Percent, FileText, MapPin,
  Plus, Award, Layout, ImageIcon, Sliders, Menu,
} from './HeroIconsHub';
import { Button, Chip, Avatar } from '@heroui/react';
import { getLocalProducts, getLocalCategories } from '../lib/supabase';
import { getCurrentERPUser, logoutERPUser } from '../lib/erpAuth';

export interface NavSearchItem {
  id: string;
  title: string;
  category: string;
  href: string;
  keywords: string;
  icon: any;
}

const SIDEBAR_NAV_ITEMS: NavSearchItem[] = [
  { id: 'nav-dashboard', title: 'Dashboard & İdarəetmə Paneli', category: 'Panellər', href: '/', keywords: 'dashboard bas sehife esaz kpi mehsul kpi analitika', icon: LayoutDashboard },
  { id: 'nav-products', title: 'Bütün məhsullar (Kataloq)', category: 'Kataloq', href: '/products', keywords: 'mehsul kataloq siyahisi mehsullar mal mallar', icon: Package },
  { id: 'nav-products-new', title: 'Yeni məhsul əlavə et', category: 'Kataloq', href: '/products/new', keywords: 'yeni mehsul elave et elave etme daxil et', icon: Plus },
  { id: 'nav-inventory', title: 'Anbar (Stok İdarəetməsi)', category: 'Kataloq', href: '/inventory', keywords: 'anbar stok artir azalt qaliq say inventory warehouse', icon: Warehouse },
  { id: 'nav-categories', title: 'Kateqoriyalar', category: 'Kataloq', href: '/categories', keywords: 'kateqoriya kateqoriyalar bolmeler parent level bolme', icon: FolderTree },
  { id: 'nav-brands', title: 'Brendlər (Markalar)', category: 'Kataloq', href: '/brands', keywords: 'brend brendler marka markalar apple samsung xiaomi', icon: Award },
  { id: 'nav-homepage', title: 'Ana Səhifə Ayarları (Önə Çıxanlar)', category: 'Marketinq', href: '/homepage-settings', keywords: 'ana sehife one cixanlar slider grid homepage vitrin', icon: Layout },
  { id: 'nav-affiliates', title: 'Affiliate Satış & Referal Linklər', category: 'Marketinq', href: '/affiliates', keywords: 'affiliate referal link komissiya partnyor', icon: Users },
  { id: 'nav-reviews', title: 'Müştəri Rəyləri', category: 'Marketinq', href: '/reviews', keywords: 'reyler rey star qiymetlendirme serh serhler', icon: MessageSquare },
  { id: 'nav-faqs', title: 'Suallar və Cavablar (FAQ)', category: 'Marketinq', href: '/faqs', keywords: 'suallar cavablar faq tez-tez verilen sorgu', icon: HelpCircle },
  { id: 'nav-coupons', title: 'Kampaniyalar & Xüsusi Badge-lər', category: 'Marketinq', href: '/coupons', keywords: 'kampaniya kampaniyalar badge etiket endirim aksiya aksiyalar', icon: Ticket },
  { id: 'nav-seo', title: 'SEO və Meta Ayarları', category: 'Marketinq', href: '/seo', keywords: 'seo meta keywords description title axtaris google', icon: Search },
  { id: 'nav-analytics', title: 'Analitika və Dövriyyə Hesabatı', category: 'Marketinq', href: '/analytics', keywords: 'analitika dovriyyə statistika hesabat aov qazanc satis', icon: BarChart3 },
  { id: 'nav-promos', title: 'Kuponlar Və Promokodlar', category: 'Marketinq', href: '/promos', keywords: 'kupon kuponlar promokod promo endirim kod', icon: Percent },
  { id: 'nav-blog', title: 'Blog Və Məqalələr', category: 'Marketinq', href: '/blog', keywords: 'blog xeber meqale meqaleler post yazi', icon: FileText },
  { id: 'nav-stores', title: 'Mağazalar Və Filiallar (Ünvanlar)', category: 'Marketinq', href: '/stores', keywords: 'magaza magazalar filiallar unvan unvanlar xerite lokasiya', icon: MapPin },
  { id: 'nav-banners', title: 'Banners & Reklam Bannerləri', category: 'Marketinq', href: '/banners', keywords: 'banner bannerler reklam slayd slider sekil visual', icon: ImageIcon },
  { id: 'nav-orders', title: 'Sifarişlər Və Satışlar', category: 'Satışlar', href: '/orders', keywords: 'sifaris sifarisler satis kassa nagd kredit icrada catdirildi', icon: ShoppingCart },
  { id: 'nav-customers', title: 'Müştərilər & CRM', category: 'Müştərilər', href: '/customers', keywords: 'musteri musteriler crm alici istifadeci elaqe telefon', icon: Users },
  { id: 'nav-employees', title: 'Əməkdaşlar & Rollar (İşçilər)', category: 'İşçilər', href: '/employees', keywords: 'isci isçiler emekdas emekdaslar rol admin superadmin menecer', icon: Users },
  { id: 'nav-settings', title: 'Sayt Ayarları & Vizuallar', category: 'Ayarlar', href: '/settings', keywords: 'ayarlar tenzimlemeler loqo reng parametr basliq proqram', icon: Sliders },
];

export interface UserProfile {
  name: string;
  role: string;
  email: string;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  // Active User State from erpAuth
  const [user, setUser] = useState<UserProfile>(() => {
    return {
      name: 'İlkin Rzayev',
      role: 'Super Admin',
      email: 'ilkinrzayev@technomania.az'
    };
  });

  // UI Dropdowns & Modals
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Password Change Form
  const [passwordForm, setPasswordForm] = useState({
    currentPass: '',
    newPass: '',
    confirmPass: '',
  });
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Dynamic Notifications State
  const [notificationTab, setNotificationTab] = useState<'system' | 'erp'>('system');
  const [systemNotifications, setSystemNotifications] = useState<Array<{ id: string; title: string; desc: string; time: string; read: boolean; link: string; type: string }>>([]);
  const [erpInternalNotifications, setErpInternalNotifications] = useState<Array<{ id: string; title: string; description: string; author_name: string; priority: string; created_at: string; read: boolean }>>([]);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);

  // Load Real Notifications
  const loadNotificationsData = async () => {
    try {
      // 1. Fetch real orders, products, and customers
      const [ordersRes, prodsRes, custRes, erpNotifsRes] = await Promise.all([
        fetch('/api/catalog/orders').then(r => r.ok ? r.json() : []).catch(() => []),
        fetch('/api/catalog/products').then(r => r.ok ? r.json() : []).catch(() => []),
        fetch('/api/catalog/customers').then(r => r.ok ? r.json() : []).catch(() => []),
        fetch('/api/catalog/erp-notifications').then(r => r.ok ? r.json() : []).catch(() => []),
      ]);

      // Build real system notifications
      const sysList: Array<{ id: string; title: string; desc: string; time: string; read: boolean; link: string; type: string }> = [];

      // Add recent orders
      if (Array.isArray(ordersRes) && ordersRes.length > 0) {
        ordersRes.slice(0, 4).forEach((ord: any) => {
          sysList.push({
            id: `ord_${ord.id}`,
            title: `🛒 Sifariş #${ord.id || ord.order_number}`,
            desc: `${ord.customerName || ord.customer_name || 'Müştəri'} — ${(ord.totalAmount || ord.total_amount || 0).toLocaleString()} ₼`,
            time: ord.createdAt || ord.created_at ? new Date(ord.createdAt || ord.created_at).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' }) : 'Canlı',
            read: false,
            link: '/orders',
            type: 'order',
          });
        });
      }

      // Add low stock warnings
      if (Array.isArray(prodsRes)) {
        const lowStock = prodsRes.filter((p: any) => (p?.stock ?? 0) <= 2).slice(0, 3);
        lowStock.forEach((p: any) => {
          sysList.push({
            id: `stk_${p.id}`,
            title: `⚠️ Kritik stok: ${p.name}`,
            desc: p.stock <= 0 ? 'Məhsul tam tükənib (0 ədəd)' : `Cəmi ${p.stock} ədəd qalıb`,
            time: 'Nəzarətdə',
            read: false,
            link: '/inventory',
            type: 'stock',
          });
        });
      }

      // Add recent customers
      if (Array.isArray(custRes) && custRes.length > 0) {
        custRes.slice(0, 2).forEach((c: any) => {
          sysList.push({
            id: `usr_${c.id}`,
            title: `👤 Yeni Müştəri: ${c.name || 'İstifadəçi'}`,
            desc: `Əlaqə: ${c.phone || c.email || 'Qeydiyyatdan keçdi'}`,
            time: c.created_at ? new Date(c.created_at).toLocaleDateString('az-AZ') : 'Aktiv',
            read: false,
            link: '/customers',
            type: 'user',
          });
        });
      }

      setSystemNotifications(sysList);

      // Set ERP Internal Notifications
      if (Array.isArray(erpNotifsRes)) {
        setErpInternalNotifications(erpNotifsRes.map((n: any) => ({ ...n, read: false })));
      }
    } catch (e) {
      console.error('Failed to load dynamic notifications:', e);
    }
  };

  useEffect(() => {
    loadNotificationsData();
    const timer = setInterval(loadNotificationsData, 30000); // refresh every 30s
    return () => clearInterval(timer);
  }, []);

  // Load User Data
  useEffect(() => {
    const active = getCurrentERPUser();
    if (active) {
      setUser({
        name: active.name,
        role: active.roleName,
        email: active.email,
      });
    }
  }, []);

  // Global Escape Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowUserDropdown(false);
        setShowNotifications(false);
        setShowPasswordModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getBreadcrumb = (path: string) => {
    if (path === '/') return { section: 'Əsas', page: 'Dashboard' };
    if (path.startsWith('/products')) return { section: 'Kataloq', page: 'Məhsullar' };
    if (path.startsWith('/categories')) return { section: 'Kataloq', page: 'Kateqoriyalar' };
    if (path.startsWith('/brands')) return { section: 'Kataloq', page: 'Brendlər' };
    if (path.startsWith('/inventory')) return { section: 'Kataloq', page: 'Anbar & Stok' };
    if (path.startsWith('/orders')) return { section: 'Satışlar', page: 'Sifarişlər' };
    if (path.startsWith('/pos')) return { section: 'Satışlar', page: 'POS Kassa Terminalı' };
    if (path.startsWith('/customers')) return { section: 'Müştərilər', page: 'Müştərilər & CRM' };
    if (path.startsWith('/employees')) return { section: 'İdarəetmə', page: 'Əməkdaşlar & Rollar' };
    if (path.startsWith('/banners')) return { section: 'Marketinq', page: 'Reklam Bannerləri' };
    if (path.startsWith('/homepage-settings')) return { section: 'Marketinq', page: 'Ana Səhifə Vitrini' };
    if (path.startsWith('/coupons') || path.startsWith('/promos')) return { section: 'Marketinq', page: 'Kuponlar & Aksiyalar' };
    if (path.startsWith('/affiliates')) return { section: 'Marketinq', page: 'Affiliate Partnyorlar' };
    if (path.startsWith('/reviews')) return { section: 'Marketinq', page: 'Müştəri Rəyləri' };
    if (path.startsWith('/faqs')) return { section: 'Marketinq', page: 'Suallar & Cavablar' };
    if (path.startsWith('/analytics')) return { section: 'Hesabatlar', page: 'Satış Analitikası' };
    if (path.startsWith('/finance')) return { section: 'Hesabatlar', page: 'Maliyyə & Z-Hesabat' };
    if (path.startsWith('/purchases')) return { section: 'Tədarük', page: 'Alış Qaimələri' };
    if (path.startsWith('/suppliers')) return { section: 'Tədarük', page: 'Təchizatçılar' };
    if (path.startsWith('/stores')) return { section: 'Tənzimləmələr', page: 'Mağazalar & Filiallar' };
    if (path.startsWith('/settings')) return { section: 'Tənzimləmələr', page: 'Sistem Ayarları' };
    return { section: 'ERP', page: 'Səhifə' };
  };

  const breadcrumb = getBreadcrumb(pathname);
  const unreadSysCount = systemNotifications.filter(n => !n.read).length;
  const unreadErpCount = erpInternalNotifications.filter(n => !n.read).length;
  const totalUnreadCount = unreadSysCount + unreadErpCount;

  const markAllNotificationsRead = () => {
    setSystemNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setErpInternalNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPass || !passwordForm.newPass || !passwordForm.confirmPass) {
      setPasswordStatus({ type: 'error', message: 'Bütün xanaları doldurun.' });
      return;
    }
    if (passwordForm.newPass.length < 6) {
      setPasswordStatus({ type: 'error', message: 'Yeni şifrə minimum 6 simvol olmalıdır.' });
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirmPass) {
      setPasswordStatus({ type: 'error', message: 'Yeni şifrələr bir-biri ilə uyğun gəlmir.' });
      return;
    }

    setPasswordStatus({ type: 'success', message: 'Şifrəniz uğurla yeniləndi!' });
    setTimeout(() => {
      setShowPasswordModal(false);
      setPasswordStatus(null);
      setPasswordForm({ currentPass: '', newPass: '', confirmPass: '' });
    }, 1500);
  };

  const handleLogout = () => {
    logoutERPUser();
  };

  const getUserInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-40 text-slate-800 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] transition-all">
        {/* Left: Mobile Toggle & Breadcrumbs */}
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('techno_toggle_mobile_sidebar'))}
            className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer border border-slate-200 flex-shrink-0 active:scale-95"
            title="Menyunu Aç"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-medium min-w-0">
            <span className="text-slate-500 font-semibold truncate hidden sm:inline">{breadcrumb.section}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline flex-shrink-0" />
            <span className="bg-[#f4f6ee] text-[#4f533b] font-bold border border-[#4f533b]/20 px-2.5 py-0.5 rounded-lg shadow-2xs text-[11px]">
              {breadcrumb.page}
            </span>
          </div>
        </div>

        {/* Right Actions Toolbar */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Mobile Search Button */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('techno_open_command_palette'))}
            className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer border border-slate-200 active:scale-95"
            title="Axtarış"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Desktop Search Trigger Button */}
          <div
            onClick={() => window.dispatchEvent(new Event('techno_open_command_palette'))}
            className="hidden lg:flex items-center gap-2 bg-slate-100/70 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-xl text-xs text-slate-500 transition-all cursor-pointer w-52 justify-between active:scale-[0.98] select-none hover:shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-medium">Axtarış edin...</span>
            </div>
            <kbd className="text-[10px] font-mono font-semibold text-slate-600 bg-white px-1.5 py-0.5 rounded-md border border-slate-200 shadow-2xs">
              ⌘K
            </kbd>
          </div>

          {/* View Storefront Link */}
          <a
            href="https://techno-mania.az"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold bg-[#4f533b] hover:bg-[#3e4230] text-white px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs hover:shadow-sm active:scale-95"
          >
            <span>Veb Mağaza</span>
            <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
          </a>

          {/* Notification Dropdown */}
          <div className="relative" ref={notificationDropdownRef}>
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 relative transition cursor-pointer border border-slate-200"
              title="Bildirişlər"
            >
              <Bell className="w-4 h-4" />
              {totalUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                  {totalUnreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white border border-slate-200 rounded-3xl shadow-2xl p-4 z-50 text-slate-800 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-slate-900">Bildiriş Mərkəzi</h4>
                    {totalUnreadCount > 0 && (
                      <span className="bg-rose-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full">
                        {totalUnreadCount} yeni
                      </span>
                    )}
                  </div>
                  {totalUnreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-[10px] font-bold text-[#4f533b] hover:underline cursor-pointer"
                    >
                      Hamısını oxundu et
                    </button>
                  )}
                </div>

                {/* Sub tabs: System events vs ERP Internal */}
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setNotificationTab('system')}
                    className={`py-1 px-2 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      notificationTab === 'system'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <span>📡 Sistem ({systemNotifications.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNotificationTab('erp')}
                    className={`py-1 px-2 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      notificationTab === 'erp'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <span>📢 ERP Elanlar ({erpInternalNotifications.length})</span>
                  </button>
                </div>

                {/* Tab 1: System Events */}
                {notificationTab === 'system' && (
                  <div className="space-y-2 text-xs max-h-72 overflow-y-auto scrollbar-thin">
                    {systemNotifications.length > 0 ? (
                      systemNotifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            setShowNotifications(false);
                            router.push(n.link);
                          }}
                          className={`p-2.5 rounded-2xl border transition cursor-pointer ${
                            n.read
                              ? 'bg-slate-50/70 border-slate-100 text-slate-500'
                              : 'bg-slate-100/80 border-slate-200 text-slate-900 hover:bg-slate-100 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900 block truncate">{n.title}</span>
                            <span className="text-[10px] font-semibold text-slate-400 flex-shrink-0">{n.time}</span>
                          </div>
                          <span className="text-[11px] text-slate-600 font-medium block mt-0.5">{n.desc}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-xs text-slate-400 font-medium">
                        Yeni sistem hadisəsi yoxdur.
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: ERP Internal Announcements */}
                {notificationTab === 'erp' && (
                  <div className="space-y-2 text-xs max-h-72 overflow-y-auto scrollbar-thin">
                    {erpInternalNotifications.length > 0 ? (
                      erpInternalNotifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-2xl border space-y-1 transition ${
                            n.priority === 'urgent'
                              ? 'bg-rose-50/70 border-rose-200'
                              : n.priority === 'warning'
                              ? 'bg-amber-50/70 border-amber-200'
                              : 'bg-slate-50/90 border-slate-200/90'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-xs text-slate-900 truncate">{n.title}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              n.priority === 'urgent' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {n.priority === 'urgent' ? '🚨 Təcili' : 'ℹ️ Elan'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{n.description}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                            <span>Müəllif: <strong className="text-slate-600">{n.author_name || 'Rəhbərlik'}</strong></span>
                            <span>{new Date(n.created_at).toLocaleDateString('az-AZ')}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 space-y-2">
                        <p className="text-xs text-slate-500 font-medium">Hələlik heç bir ERP daxili elanı yoxdur.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setShowNotifications(false);
                            router.push('/marketing/notifications');
                          }}
                          className="text-[11px] font-bold text-[#4f533b] hover:underline cursor-pointer"
                        >
                          + Yeni elan yarat →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative pl-3 border-l border-slate-200 flex-shrink-0" ref={userDropdownRef}>
            <button
              type="button"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-2xl hover:bg-slate-100/90 border border-slate-200/80 transition-all cursor-pointer text-left flex-shrink-0 group shadow-2xs"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#4f533b] to-[#3a3d2b] text-white font-black text-xs flex items-center justify-center shadow-xs border border-white/20 flex-shrink-0 ring-2 ring-slate-100 group-hover:ring-slate-200 transition-all">
                <span>{getUserInitials(user.name)}</span>
              </div>
              <div className="hidden sm:block min-w-0 max-w-[130px]">
                <span className="text-xs font-bold text-slate-900 block leading-tight truncate">{user.name}</span>
                <span className="text-[10px] text-slate-500 font-medium block truncate">{user.role}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform hidden sm:block flex-shrink-0" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 text-slate-800 space-y-1 animate-fadeIn">
                <div className="px-3 py-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900 block truncate">{user.name}</span>
                  <span className="text-[10px] text-slate-500 block truncate">{user.email}</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowUserDropdown(false);
                    setShowPasswordModal(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                >
                  <Key className="w-4 h-4 text-[#4f533b]" />
                  <span>Şifrəni dəyişdir</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer border-t border-slate-100 mt-1"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Çıxış et</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ═══ CHANGE PASSWORD MODAL ═══ */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-fadeIn"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-[#4f533b]" /> Şifrəni Dəyişdir
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {passwordStatus && (
              <div className={`p-3 rounded-xl text-xs font-semibold border ${passwordStatus.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                {passwordStatus.message}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 font-semibold mb-1 block">Cari Şifrəniz</label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPass}
                  onChange={e => setPasswordForm({ ...passwordForm, currentPass: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-[#4f533b] transition"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold mb-1 block">Yeni Şifrə</label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPass}
                  onChange={e => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-[#4f533b] transition"
                  placeholder="Ən azı 6 simvol"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold mb-1 block">Yeni Şifrə (Təkrar)</label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPass}
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPass: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-[#4f533b] transition"
                  placeholder="Şifrəni təkrar daxil edin"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#4f533b] hover:bg-[#3e4230] text-white font-bold py-2.5 rounded-xl transition cursor-pointer text-xs"
                >
                  Yadda Saxla
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition cursor-pointer text-xs"
                >
                  Ləğv Et
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
