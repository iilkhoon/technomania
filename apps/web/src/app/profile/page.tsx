'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { toSlug } from '../data/products';
import {
  UserIcon,
  SparklesIcon,
  KeyIcon,
  BellIcon,
  HeartIcon,
  ArrowRightStartOnRectangleIcon as ArrowRightOnRectangleIcon,
  LockClosedIcon,
  CalendarIcon,
  IdentificationIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
  TrophyIcon as AwardIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';

export default function CustomerProfilePage() {
  const router = useRouter();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'account' | 'privileges' | 'password' | 'notifications' | 'favorites'>('account');
  const [customer, setCustomer] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Form states - Account Info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [finCode, setFinCode] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [idSerial, setIdSerial] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [address, setAddress] = useState('');

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  // Privileges & Notifications states
  const [privileges, setPrivileges] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedPrivilege, setSelectedPrivilege] = useState<any | null>(null);

  // Favorites state
  const [favoriteProducts, setFavoriteProducts] = useState<any[]>([]);
  const [favoritesList, setFavoritesList] = useState<string[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    setIsMounted(true);
    // Dark mode check
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      setIsDarkMode(savedTheme === 'dark');

      const savedUser = localStorage.getItem('technomania_customer_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setCustomer(parsed);
          setName(parsed.name || '');
          setEmail(parsed.email || '');
          setPhone(parsed.phone || '');
          setFinCode(parsed.fin_code || '');
          setBirthDate(parsed.birth_date || '');
          setIdSerial(parsed.id_serial || '');
          setFatherName(parsed.father_name || '');
          setAddress(parsed.address || '');
        } catch (e) {}
      } else {
        // If not logged in, trigger auth modal and redirect to home
        window.dispatchEvent(new CustomEvent('techno_open_auth_modal'));
        router.push('/?is_show_login_popup=1');
      }

      // Load favorites IDs
      const savedFavs = localStorage.getItem('technomania_favorites');
      if (savedFavs) {
        try {
          setFavoritesList(JSON.parse(savedFavs));
        } catch (e) {}
      }

      const savedCart = localStorage.getItem('technomania_cart');
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {}
      }
    }

    // Load Privileges
    fetch('/api/catalog/privileges', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setPrivileges(data); })
      .catch(() => {});

    // Load Notifications
    fetch('/api/catalog/notifications', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setNotifications(data); })
      .catch(() => {});

    // Load Live Products for Favorites
    fetch('/api/catalog/products', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          let favIds: string[] = [];
          try {
            const raw = localStorage.getItem('technomania_favorites');
            if (raw) favIds = JSON.parse(raw);
          } catch (e) {}
          setFavoriteProducts(data.filter(p => favIds.includes(p.id)));
        }
      })
      .catch(() => {});
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess('');
    setSaveError('');
    setLoading(true);

    try {
      const res = await fetch('/api/catalog/customer/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: customer?.id,
          name,
          email,
          fin_code: finCode,
          birth_date: birthDate,
          id_serial: idSerial,
          father_name: fatherName,
          address,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Profil yenilənərkən xəta baş verdi.');
      }

      setCustomer(data.customer);
      if (typeof window !== 'undefined') {
        localStorage.setItem('technomania_customer_user', JSON.stringify(data.customer));
        window.dispatchEvent(new CustomEvent('technomania_customer_auth_changed', { detail: data.customer }));
      }
      setSaveSuccess('Məlumatlarınız uğurla yadda saxlanıldı!');
    } catch (err: any) {
      setSaveError(err.message || 'Xəta baş verdi.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess('');
    setSaveError('');

    if (!oldPassword || !newPassword) {
      setSaveError('Bütün xanaları doldurun.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setSaveError('Yeni şifrə və şifrə təkrarı uyğun gəlmir.');
      return;
    }

    if (newPassword.length < 6) {
      setSaveError('Yeni şifrə minimum 6 simvoldan ibarət olmalıdır.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/catalog/customer/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: customer?.id,
          oldPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Şifrə dəyişdirilərkən xəta baş verdi.');
      }

      setSaveSuccess('Şifrəniz uğurla yeniləndi!');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setSaveError(err.message || 'Cari şifrə yanlışdır.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('technomania_customer_user');
      window.dispatchEvent(new CustomEvent('technomania_customer_auth_changed', { detail: null }));
    }
    router.push('/');
  };

  const getInitials = (fullName?: string) => {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  if (!isMounted || !customer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-3 border-[#4f533b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-[#0b101b] text-white' : 'bg-[#f8fafc] text-slate-900'}`}>
      <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

      <main className="flex-1 w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Top Breadcrumb & User Welcome Banner */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#4f533b] to-[#2c301f] text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 backdrop-blur-3xl transform skew-x-12 pointer-events-none" />

          <div className="flex items-center gap-4 sm:gap-6 relative z-10">
            {/* Initials Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white/15 backdrop-blur-md text-white border-2 border-white/30 flex items-center justify-center font-black text-2xl sm:text-3xl shadow-lg flex-shrink-0">
              {getInitials(customer.name)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-3xl font-black tracking-tight">{customer.name || 'Hörmətli Müştəri'}</h1>
              </div>
              <p className="text-xs sm:text-sm text-stone-200 mt-1 font-medium flex items-center gap-2">
                <span>{customer.phone}</span>
                {customer.email && <span>• {customer.email}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-rose-600/80 text-white text-xs sm:text-sm font-bold backdrop-blur-md border border-white/20 transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              <span>Çıxış Et</span>
            </button>
          </div>
        </div>

        {/* Profile Content Layout: Left Tabs Sidebar + Right Main Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8 items-start">
          {/* ═══ LEFT SIDEBAR TABS ═══ */}
          <div className={`rounded-3xl p-3 sm:p-4 border shadow-sm space-y-1.5 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'
          }`}>
            <button
              type="button"
              onClick={() => { setActiveTab('account'); setSaveSuccess(''); setSaveError(''); }}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeTab === 'account'
                  ? 'bg-[#4f533b] text-white shadow-md shadow-[#4f533b]/20'
                  : isDarkMode
                  ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <UserIcon className="w-5 h-5 flex-shrink-0" />
              <span>Hesab Məlumatları</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('privileges'); setSaveSuccess(''); setSaveError(''); }}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeTab === 'privileges'
                  ? 'bg-[#4f533b] text-white shadow-md shadow-[#4f533b]/20'
                  : isDarkMode
                  ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <SparklesIcon className="w-5 h-5 flex-shrink-0" />
                <span>İmtiyazlar</span>
              </div>
              {privileges.length > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  activeTab === 'privileges' ? 'bg-white/20 text-white' : 'bg-[#4f533b]/10 text-[#4f533b] dark:text-[#a3a886]'
                }`}>
                  {privileges.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('password'); setSaveSuccess(''); setSaveError(''); }}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeTab === 'password'
                  ? 'bg-[#4f533b] text-white shadow-md shadow-[#4f533b]/20'
                  : isDarkMode
                  ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <KeyIcon className="w-5 h-5 flex-shrink-0" />
              <span>Şifrəni Dəyiş</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('notifications'); setSaveSuccess(''); setSaveError(''); }}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeTab === 'notifications'
                  ? 'bg-[#4f533b] text-white shadow-md shadow-[#4f533b]/20'
                  : isDarkMode
                  ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <BellIcon className="w-5 h-5 flex-shrink-0" />
                <span>Bildirişlərim</span>
              </div>
              {notifications.length > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  activeTab === 'notifications' ? 'bg-white/20 text-white' : 'bg-rose-500 text-white'
                }`}>
                  {notifications.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('favorites'); setSaveSuccess(''); setSaveError(''); }}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeTab === 'favorites'
                  ? 'bg-[#4f533b] text-white shadow-md shadow-[#4f533b]/20'
                  : isDarkMode
                  ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <HeartIcon className="w-5 h-5 flex-shrink-0" />
                <span>Seçilmişlər</span>
              </div>
              {favoriteProducts.length > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  activeTab === 'favorites' ? 'bg-white/20 text-white' : 'bg-[#4f533b]/10 text-[#4f533b] dark:text-[#a3a886]'
                }`}>
                  {favoriteProducts.length}
                </span>
              )}
            </button>
          </div>

          {/* ═══ RIGHT PANEL CONTENT ═══ */}
          <div className={`lg:col-span-3 rounded-3xl p-6 sm:p-8 border shadow-sm ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'
          }`}>
            {/* Feedback Alerts */}
            {saveSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2.5 mb-6 animate-fadeIn">
                <CheckCircleIcon className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{saveSuccess}</span>
              </div>
            )}

            {saveError && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-bold flex items-center gap-2.5 mb-6 animate-shake">
                <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 text-rose-500" />
                <span>{saveError}</span>
              </div>
            )}

            {/* 1. HESAB MƏLUMATLARI TAB */}
            {activeTab === 'account' && (
              <div>
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                  <h2 className="text-lg sm:text-xl font-black">Hesab Məlumatları</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Şəxsi məlumatlarınızı yeniləyin və dəqiq saxlayın.
                  </p>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Ad Soyad */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                        Ad və Soyad *
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={`w-full rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold outline-none border transition ${
                            isDarkMode
                              ? 'bg-slate-800 border-slate-700 focus:border-[#4f533b] text-white'
                              : 'bg-slate-50 border-slate-200 focus:border-[#4f533b] text-slate-900'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                        E-poçt Ünvanı
                      </label>
                      <div className="relative">
                        <EnvelopeIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="email"
                          placeholder="nümünə@domain.az"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold outline-none border transition ${
                            isDarkMode
                              ? 'bg-slate-800 border-slate-700 focus:border-[#4f533b] text-white'
                              : 'bg-slate-50 border-slate-200 focus:border-[#4f533b] text-slate-900'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Mobil Nömrə (LOCKED / READONLY) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Mobil Nömrə (Kilidli)
                        </label>
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                          <LockClosedIcon className="w-3 h-3" /> Dəyişdirilə bilməz
                        </span>
                      </div>
                      <div className="relative">
                        <PhoneIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          readOnly
                          disabled
                          value={phone}
                          className="w-full rounded-2xl pl-10 pr-4 py-3 text-sm font-bold outline-none border border-dashed border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* FİN Kod */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                        FİN Kod (7 simvol)
                      </label>
                      <div className="relative">
                        <IdentificationIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          maxLength={7}
                          placeholder="Məs: 7ABC123"
                          value={finCode}
                          onChange={(e) => setFinCode(e.target.value.toUpperCase())}
                          className={`w-full rounded-2xl pl-10 pr-4 py-3 text-sm font-mono font-bold uppercase outline-none border transition ${
                            isDarkMode
                              ? 'bg-slate-800 border-slate-700 focus:border-[#4f533b] text-white'
                              : 'bg-slate-50 border-slate-200 focus:border-[#4f533b] text-slate-900'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Doğum Tarixi (Brand-themed calendar input) */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                        Doğum Tarixi
                      </label>
                      <div className="relative">
                        <CalendarIcon className="w-4 h-4 text-[#4f533b] dark:text-[#a3a886] absolute left-3.5 top-3.5 pointer-events-none" />
                        <input
                          type="date"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          className={`w-full rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold outline-none border transition ${
                            isDarkMode
                              ? 'bg-slate-800 border-slate-700 focus:border-[#4f533b] text-white scheme-dark'
                              : 'bg-slate-50 border-slate-200 focus:border-[#4f533b] text-slate-900'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Ş/V Seriya və Nömrəsi */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                        Ş/V Seriya və Nömrəsi
                      </label>
                      <div className="relative">
                        <IdentificationIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          placeholder="Məs: AZE 12345678"
                          value={idSerial}
                          onChange={(e) => setIdSerial(e.target.value.toUpperCase())}
                          className={`w-full rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold outline-none border transition ${
                            isDarkMode
                              ? 'bg-slate-800 border-slate-700 focus:border-[#4f533b] text-white'
                              : 'bg-slate-50 border-slate-200 focus:border-[#4f533b] text-slate-900'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Ata Adı */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                        Ata Adı
                      </label>
                      <input
                        type="text"
                        placeholder="Məs: Rəhim"
                        value={fatherName}
                        onChange={(e) => setFatherName(e.target.value)}
                        className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold outline-none border transition ${
                          isDarkMode
                            ? 'bg-slate-800 border-slate-700 focus:border-[#4f533b] text-white'
                            : 'bg-slate-50 border-slate-200 focus:border-[#4f533b] text-slate-900'
                        }`}
                      />
                    </div>

                    {/* Yaşayış Yeri / Faktiki Ünvan */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                        Yaşayış Yeri / Faktiki Ünvan
                      </label>
                      <div className="relative">
                        <MapPinIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          placeholder="Məs: Bakı ş., Nəsimi r., 28 May küç."
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className={`w-full rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold outline-none border transition ${
                            isDarkMode
                              ? 'bg-slate-800 border-slate-700 focus:border-[#4f533b] text-white'
                              : 'bg-slate-50 border-slate-200 focus:border-[#4f533b] text-slate-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3.5 rounded-2xl bg-[#4f533b] hover:bg-[#3e4230] text-white font-black text-sm shadow-md shadow-[#4f533b]/25 transition flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>Dəyişiklikləri Yadda Saxla</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 2. İMTİYAZLAR TAB */}
            {activeTab === 'privileges' && (
              <div>
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                  <h2 className="text-lg sm:text-xl font-black">Xüsusi Müştəri İmtiyazları</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    TechnoMania VIP müştəriləri üçün təqdim edilən eksklüziv fürsətlər və üstünlüklər.
                  </p>
                </div>

                {privileges.length === 0 ? (
                  <div className="py-12 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <AwardIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Hal-hazırda aktiv imtiyaz qeydə alınmayıb.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {privileges.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPrivilege(p)}
                        className={`p-5 rounded-3xl border transition-all cursor-pointer group hover:scale-102 hover:shadow-lg relative overflow-hidden ${
                          isDarkMode
                            ? 'bg-slate-800/70 border-slate-700 hover:border-[#4f533b]'
                            : 'bg-slate-50 border-slate-200 hover:border-[#4f533b]'
                        }`}
                      >
                        {p.badge && (
                          <span className="absolute top-3.5 right-3.5 bg-amber-400 text-slate-950 font-black text-[9px] px-2.5 py-0.5 rounded-full shadow-xs">
                            {p.badge}
                          </span>
                        )}

                        <div className="w-12 h-12 rounded-2xl bg-[#4f533b]/10 text-[#4f533b] dark:text-[#a3a886] flex items-center justify-center mb-4 border border-[#4f533b]/20 group-hover:scale-110 transition">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.title} className="w-6 h-6 object-contain" />
                          ) : (
                            <AwardIcon className="w-6 h-6" />
                          )}
                        </div>

                        <h3 className="font-black text-base text-slate-900 dark:text-white mb-1.5 group-hover:text-[#4f533b] dark:group-hover:text-[#a3a886] transition">
                          {p.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {p.description}
                        </p>

                        <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] font-bold text-[#4f533b] dark:text-[#a3a886]">
                          <span>Ətraflı bax</span>
                          <span>→</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. ŞİFRƏNİ DƏYİŞ TAB */}
            {activeTab === 'password' && (
              <div>
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                  <h2 className="text-lg sm:text-xl font-black">Şifrənin Yenilənməsi</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Hesabınızın təhlükəsizliyi üçün köhnə şifrənizi daxil edərək yeni şifrə təyin edin.
                  </p>
                </div>

                <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                      Cari (Köhnə) Şifrə *
                    </label>
                    <div className="relative">
                      <LockClosedIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type={showOldPass ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className={`w-full rounded-2xl pl-10 pr-10 py-3 text-sm font-semibold outline-none border transition ${
                          isDarkMode
                            ? 'bg-slate-800 border-slate-700 focus:border-[#4f533b] text-white'
                            : 'bg-slate-50 border-slate-200 focus:border-[#4f533b] text-slate-900'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPass(!showOldPass)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                      >
                        {showOldPass ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                      Yeni Şifrə (Min. 6 simvol) *
                    </label>
                    <div className="relative">
                      <LockClosedIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={`w-full rounded-2xl pl-10 pr-10 py-3 text-sm font-semibold outline-none border transition ${
                          isDarkMode
                            ? 'bg-slate-800 border-slate-700 focus:border-[#4f533b] text-white'
                            : 'bg-slate-50 border-slate-200 focus:border-[#4f533b] text-slate-900'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPass ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                      Yeni Şifrə Təkrarı *
                    </label>
                    <div className="relative">
                      <LockClosedIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className={`w-full rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold outline-none border transition ${
                          isDarkMode
                            ? 'bg-slate-800 border-slate-700 focus:border-[#4f533b] text-white'
                            : 'bg-slate-50 border-slate-200 focus:border-[#4f533b] text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-2xl bg-[#4f533b] hover:bg-[#3e4230] text-white font-black text-sm shadow-md shadow-[#4f533b]/25 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>Şifrəni Yenilə</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 4. BİLDİRİŞLƏRİM TAB */}
            {activeTab === 'notifications' && (
              <div>
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                  <h2 className="text-lg sm:text-xl font-black">Sistem və Marketinq Bildirişləri</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Kampaniyalar, xüsusi təkliflər və sistem xəbərdarlıqları.
                  </p>
                </div>

                {notifications.length === 0 ? (
                  <div className="py-12 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <BellIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Hazırda heç bir yeni bildirişiniz yoxdur.</p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-4 transition ${
                          isDarkMode ? 'bg-slate-800/70 border-slate-700' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#4f533b]/10 text-[#4f533b] dark:text-[#a3a886] flex items-center justify-center flex-shrink-0">
                          <BellIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                              {n.title}
                            </h3>
                            <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                              {new Date(n.created_at || Date.now()).toLocaleDateString('az-AZ')}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {n.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. SEÇİLMİŞLƏR (FAVORİTLƏR) TAB */}
            {activeTab === 'favorites' && (
              <div>
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                  <h2 className="text-lg sm:text-xl font-black">Bəyəndiyiniz Məhsullar</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Yadda saxladığınız sevimli məhsulların siyahısı.
                  </p>
                </div>

                {favoriteProducts.length === 0 ? (
                  <div className="py-12 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <HeartIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                    <h3 className="text-base font-black mb-1">Seçilmişlər siyahınız boşdur</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                      Bəyəndiyiniz məhsulları ürək ikonuna basaraq bura əlavə edə bilərsiniz.
                    </p>
                    <button
                      onClick={() => router.push('/')}
                      className="px-6 py-2.5 rounded-xl bg-[#4f533b] hover:bg-[#3e4230] text-white font-bold text-xs shadow-md transition"
                    >
                      Məhsullara Bax
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {favoriteProducts.map((prod) => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        isFav={true}
                        isInCart={!!cart.find(c => c.id === prod.id)}
                        onToggleFavorite={() => {
                          const updated = favoritesList.filter(id => id !== prod.id);
                          setFavoritesList(updated);
                          setFavoriteProducts(favoriteProducts.filter(p => p.id !== prod.id));
                          localStorage.setItem('technomania_favorites', JSON.stringify(updated));
                        }}
                        onToggleCart={() => {
                          let updatedCart = [...cart];
                          const exists = updatedCart.find(c => c.id === prod.id);
                          if (exists) updatedCart = updatedCart.filter(c => c.id !== prod.id);
                          else updatedCart.push(prod);
                          setCart(updatedCart);
                          localStorage.setItem('technomania_cart', JSON.stringify(updatedCart));
                        }}
                        onToggleCompare={() => {}}
                        onSelectProduct={(p) => router.push(`/product/${toSlug(p.model_name || p.id)}`)}
                        isDarkMode={isDarkMode}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ═══ PRIVILEGE DETAIL MODAL ═══ */}
        {selectedPrivilege && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setSelectedPrivilege(null)}
            />
            <div className={`relative w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl z-10 border animate-scaleUp ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
            }`}>
              <button
                onClick={() => setSelectedPrivilege(null)}
                className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 rounded-3xl bg-[#4f533b]/10 text-[#4f533b] dark:text-[#a3a886] flex items-center justify-center mb-5 border border-[#4f533b]/20">
                {selectedPrivilege.image_url ? (
                  <img src={selectedPrivilege.image_url} alt={selectedPrivilege.title} className="w-8 h-8 object-contain" />
                ) : (
                  <AwardIcon className="w-8 h-8" />
                )}
              </div>

              {selectedPrivilege.badge && (
                <span className="inline-block bg-amber-400 text-slate-950 font-black text-[10px] px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                  {selectedPrivilege.badge}
                </span>
              )}

              <h3 className="text-xl sm:text-2xl font-black mb-3">{selectedPrivilege.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line mb-6">
                {selectedPrivilege.description}
              </p>

              <button
                type="button"
                onClick={() => setSelectedPrivilege(null)}
                className="w-full py-3 rounded-2xl bg-[#4f533b] hover:bg-[#3e4230] text-white font-bold text-sm transition"
              >
                Anladım
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}
