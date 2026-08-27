'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  XMarkIcon as X,
  UserIcon as User,
  PhoneIcon as Phone,
  LockClosedIcon as Lock,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  SparklesIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface AuthModalProps {
  isDarkMode?: boolean;
}

function AuthModalContent({ isDarkMode = false }: AuthModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Form states
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check URL query parameter: ?is_show_login_popup=1
  useEffect(() => {
    const isShow = searchParams.get('is_show_login_popup');
    if (isShow === '1' || isShow === 'true') {
      setIsOpen(true);
      const tabParam = searchParams.get('auth_tab');
      if (tabParam === 'register') setActiveTab('register');
      else setActiveTab('login');
    }
  }, [searchParams]);

  // Listen to window open event
  useEffect(() => {
    const handleOpenAuth = (e: any) => {
      setIsOpen(true);
      setErrorMsg('');
      setSuccessMsg('');
      if (e?.detail?.tab === 'register') setActiveTab('register');
      else setActiveTab('login');
    };

    window.addEventListener('techno_open_auth_modal', handleOpenAuth);
    return () => window.removeEventListener('techno_open_auth_modal', handleOpenAuth);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setErrorMsg('');
    setSuccessMsg('');
    // Remove query param without full reload if it was present
    if (searchParams.get('is_show_login_popup')) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('is_show_login_popup');
      params.delete('auth_tab');
      const newQuery = params.toString();
      router.replace(newQuery ? `${pathname}?${newQuery}` : pathname, { scroll: false });
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/catalog/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Mobil nömrə və ya şifrə yanlışdır.');
      }

      // Save customer session
      if (typeof window !== 'undefined') {
        localStorage.setItem('technomania_customer_user', JSON.stringify(data.customer));
        window.dispatchEvent(new CustomEvent('technomania_customer_auth_changed', { detail: data.customer }));
      }

      handleClose();
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Daxil olarkən xəta baş verdi.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim() || !phone.trim() || !password) {
      setErrorMsg('Bütün xanaları doldurun.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Şifrə və şifrə təkrarı uyğun gəlmir.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Şifrə minimum 6 simvoldan ibarət olmalıdır.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/catalog/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Qeydiyyat zamanı xəta baş verdi.');
      }

      // Registration successful! Switch to login tab
      setSuccessMsg('Qeydiyyat uğurla tamamlandı! İndi daxil ola bilərsiniz.');
      setActiveTab('login');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Qeydiyyat zamanı xəta baş verdi.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const modalNode = (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop with Frosted Glass Blur */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-md backdrop-filter transition-opacity duration-300 animate-fadeIn"
        onClick={handleClose}
      />

      {/* Modal Card Centered in Screen */}
      <div
        className={`relative w-full max-w-md my-auto rounded-3xl p-6 sm:p-8 shadow-2xl transition-all z-20 animate-scaleUp border ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900'
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          aria-label="Bağla"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#4f533b]/10 text-[#4f533b] dark:text-[#a3a886] flex items-center justify-center mx-auto mb-3 border border-[#4f533b]/20 shadow-xs">
            <User className="w-6 h-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            {activeTab === 'login' ? 'Şəxsi Kabinetə Giriş' : 'Yeni Hesab Yarat'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {activeTab === 'login'
              ? 'Xoş gəlmisiniz! Sifarişlərinizi və imtiyazlarınızı izləyin.'
              : 'Qeydiyyatdan keçərək xüsusi təkliflərdən və endirimlərdən faydalanın.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-1.5 mb-6 border border-slate-200/60 dark:border-slate-700/60">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Daxil Ol
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Qeydiyyat
          </button>
        </div>

        {/* Success Alert Message */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-4 flex items-center gap-2.5 animate-fadeIn">
            <CheckCircleIcon className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert Message */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-xs font-bold mb-4 flex items-center gap-2.5 animate-shake">
            <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ─── TAB 1: LOGIN FORM ─── */}
        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Mobil Nömrə *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="+994 (50) 123-45-67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium outline-none focus:border-[#4f533b] dark:focus:border-[#a3a886] transition"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Şifrə *
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Şifrənizi daxil edin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium outline-none focus:border-[#4f533b] dark:focus:border-[#a3a886] transition"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs sm:text-sm font-black shadow-lg shadow-[#4f533b]/25 transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Kabinetə Daxil Ol</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">Hesabınız yoxdur? </span>
              <button
                type="button"
                onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
                className="text-xs font-bold text-[#4f533b] dark:text-[#a3a886] hover:underline cursor-pointer"
              >
                Qeydiyyatdan keçin
              </button>
            </div>
          </form>
        ) : (
          /* ─── TAB 2: REGISTER FORM ─── */
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Ad və Soyad *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Məs: Əli Əliyev"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-[#4f533b] dark:focus:border-[#a3a886] transition"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Mobil Nömrə *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="+994 (50) 123-45-67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-[#4f533b] dark:focus:border-[#a3a886] transition"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Şifrə (minimum 6 simvol) *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Şifrə təyin edin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-[#4f533b] dark:focus:border-[#a3a886] transition"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Şifrənin Təkrarı *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Şifrəni təkrar daxil edin"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-[#4f533b] dark:focus:border-[#a3a886] transition"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs sm:text-sm font-black shadow-lg shadow-[#4f533b]/25 transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Qeydiyyatı Tamamla</span>
                  <SparklesIcon className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">Artıq hesabınız var? </span>
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
                className="text-xs font-bold text-[#4f533b] dark:text-[#a3a886] hover:underline cursor-pointer"
              >
                Daxil olun
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
}

export default function AuthModal(props: AuthModalProps) {
  return (
    <React.Suspense fallback={null}>
      <AuthModalContent {...props} />
    </React.Suspense>
  );
}
