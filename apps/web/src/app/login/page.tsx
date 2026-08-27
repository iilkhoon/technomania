'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Eye, EyeOff, Mail, Lock, Smartphone, ArrowRight,
  ShieldCheck, Sparkles, CheckCircle, Globe, Sun, Moon,
  PhoneCall, MapPin, ShoppingCart, Heart, Scale, User, Menu, Search,
  Star, Zap,
} from '../components/HeroIconsHub';
import { Button } from '@heroui/react';
import { translations, Language } from '../data/translations';
import Header from '../components/Header';

import Footer from '../components/Footer';

export default function LoginPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>('AZ');
  const t = translations[currentLang] || translations.AZ;

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+994 ');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const savedLang = (localStorage.getItem('technomania_lang') as Language) || 'AZ';
    if (savedLang && (savedLang === 'AZ' || savedLang === 'EN' || savedLang === 'RU')) {
      setCurrentLang(savedLang);
    }
    const savedDark = localStorage.getItem('technomania_dark') === 'true';
    setIsDarkMode(savedDark);
  }, []);

  const handleLangChange = (lang: Language) => {
    setCurrentLang(lang);
    localStorage.setItem('technomania_lang', lang);
  };

  const handleDarkToggle = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem('technomania_dark', String(next));
  };

  const dark = isDarkMode;

  const labels = {
    AZ: {
      title: 'Hesabınıza daxil olun',
      subtitle: 'TechnoMania eksklüziv təkliflərinə çıxış əldə edin',
      phoneTab: 'Mobil telefon',
      emailTab: 'E-poçt ünvanı',
      phonePh: '+994 50 000 00 00',
      emailPh: 'nümunə@mail.com',
      passLabel: 'Şifrə',
      passPh: '••••••••',
      forgot: 'Şifrəni unutmusunuz?',
      btn: 'Daxil ol',
      or: 'və ya',
      withGoogle: 'Google ilə daxil ol',
      noAcc: 'Hesabınız yoxdur?',
      register: 'Qeydiyyatdan keçin',
      feature1: 'Hissə-hissə ödəniş imkanı 24 ayadək',
      feature2: 'Bonuslar və cashback proqramı',
      feature3: 'Rəsmi zəmanət və pulsuz çatdırılma',
      emptyErr: 'Zəhmət olmasa bütün xanaları doldurun',
      successMsg: 'Uğurla daxil oldunuz! Yönləndirilirsiniz...',
    },
    EN: {
      title: 'Sign in to your account',
      subtitle: 'Access TechnoMania exclusive deals & bonuses',
      phoneTab: 'Mobile Phone',
      emailTab: 'Email Address',
      phonePh: '+994 50 000 00 00',
      emailPh: 'example@mail.com',
      passLabel: 'Password',
      passPh: '••••••••',
      forgot: 'Forgot password?',
      btn: 'Sign In',
      or: 'or',
      withGoogle: 'Sign in with Google',
      noAcc: "Don't have an account?",
      register: 'Register now',
      feature1: 'Installment up to 24 months',
      feature2: 'Bonuses & cashback rewards',
      feature3: 'Official warranty & free shipping',
      emptyErr: 'Please fill in all fields',
      successMsg: 'Successfully signed in! Redirecting...',
    },
    RU: {
      title: 'Войдите в свой аккаунт',
      subtitle: 'Получите доступ к эксклюзивным скидкам TechnoMania',
      phoneTab: 'Мобильный телефон',
      emailTab: 'Эл. почта',
      phonePh: '+994 50 000 00 00',
      emailPh: 'example@mail.com',
      passLabel: 'Пароль',
      passPh: '••••••••',
      forgot: 'Забыли пароль?',
      btn: 'Войти',
      or: 'или',
      withGoogle: 'Войти через Google',
      noAcc: 'Нет аккаунта?',
      register: 'Зарегистрироваться',
      feature1: 'Рассрочка до 24 месяцев',
      feature2: 'Бонусы и кэшбэк',
      feature3: 'Официальная гарантия и доставка',
      emptyErr: 'Пожалуйста, заполните все поля',
      successMsg: 'Успешный вход! Перенаправление...',
    },
  };

  const label = labels[currentLang] || labels.AZ;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const id = loginMethod === 'phone' ? phone.trim() : email.trim();
    if (!id || id === '+994' || !password) {
      setError(label.emptyErr);
      return;
    }
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setIsLoading(false);
    setSuccess(true);
    const isAdmin = id.toLowerCase().includes('admin') || password.toLowerCase().includes('admin');
    setTimeout(() => {
      if (isAdmin) {
        window.location.href = '/erp';
      } else {
        router.push('/');
      }
    }, 800);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${dark ? 'bg-[#0b0f19] text-slate-100' : 'bg-[#f4f6f8] text-slate-900'}`}>
      <Header
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        currentLang={currentLang}
        setCurrentLang={handleLangChange}
      />

      {/* PAGE BODY */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 relative overflow-hidden">
        {/* Subtle Ambient Background Orbs */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#4f533b]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800/80 relative z-10 backdrop-blur-md">

          {/* LEFT PANEL: Branding & Value Props (5 cols) */}
          <div className="lg:col-span-5 relative bg-gradient-to-br from-[#4f533b] via-[#3a3d2b] to-[#25281b] text-white p-8 sm:p-10 flex flex-col justify-between overflow-hidden">
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/5 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-60 h-60 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
                <span className="font-black text-3xl tracking-tighter text-white">techno</span>
                <span className="font-black text-3xl tracking-tighter text-amber-300">mania</span>
              </Link>

              <h2 className="text-2xl sm:text-3xl font-black leading-tight mb-2.5 text-white">
                {label.title}
              </h2>
              <p className="text-stone-300 text-xs sm:text-sm font-medium mb-8 leading-relaxed">
                {label.subtitle}
              </p>

              <div className="space-y-3">
                {[
                  { text: label.feature1, icon: ShoppingCart },
                  { text: label.feature2, icon: Star },
                  { text: label.feature3, icon: Zap },
                ].map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/10 transition"
                    >
                      <div className="w-7 h-7 rounded-xl bg-amber-300/20 text-amber-300 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-xs sm:text-sm text-stone-100">{f.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex items-center gap-2 text-stone-300 text-xs">
              <ShieldCheck className="w-4 h-4 text-amber-300 flex-shrink-0" />
              <span>256-bit SSL şifrələnmiş təhlükəsiz bağlantı</span>
            </div>
          </div>

          {/* RIGHT PANEL: Form (7 cols) */}
          <div className={`lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center ${dark ? 'bg-slate-900/95' : 'bg-white'}`}>

            {success ? (
              <div className="text-center py-12 flex flex-col items-center gap-4 animate-fadeIn">
                <div className="w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-inner text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-10 h-10 animate-bounce" />
                </div>
                <h3 className="font-black text-xl text-slate-900 dark:text-white">Xoş gəldiniz!</h3>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{label.successMsg}</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{label.title}</h1>
                  <p className={`text-xs sm:text-sm font-medium ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Xoş gəlmisiniz! Zəhmət olmasa daxil olun.
                  </p>
                </div>

                {/* Switcher */}
                <div className={`flex rounded-2xl p-1 mb-6 border ${dark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                  {(['phone', 'email'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => { setLoginMethod(m); setError(''); }}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 ${
                        loginMethod === m
                          ? 'bg-[#4f533b] text-white shadow-md shadow-[#4f533b]/25'
                          : dark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {m === 'phone' ? <Smartphone className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
                      {m === 'phone' ? label.phoneTab : label.emailTab}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {loginMethod === 'phone' ? label.phoneTab : label.emailTab}
                    </label>
                    <div className="relative">
                      {loginMethod === 'phone'
                        ? <Smartphone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        : <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />}
                      <input
                        type={loginMethod === 'phone' ? 'tel' : 'email'}
                        placeholder={loginMethod === 'phone' ? label.phonePh : label.emailPh}
                        value={loginMethod === 'phone' ? phone : email}
                        onChange={e => loginMethod === 'phone' ? setPhone(e.target.value) : setEmail(e.target.value)}
                        className={`w-full border rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold outline-none focus:border-[#4f533b] focus:ring-2 focus:ring-[#4f533b]/20 transition placeholder:text-slate-400 ${
                          dark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={`text-xs font-bold ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{label.passLabel}</label>
                      <Link href="/forgot-password" className="text-xs font-bold text-[#4f533b] hover:underline">{label.forgot}</Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={label.passPh}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className={`w-full border rounded-2xl pl-10 pr-11 py-3 text-sm font-semibold outline-none focus:border-[#4f533b] focus:ring-2 focus:ring-[#4f533b]/20 transition placeholder:text-slate-400 ${
                          dark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/50 px-3.5 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900 animate-fadeIn">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    isDisabled={isLoading}
                    className="w-full bg-[#4f533b] hover:bg-[#3e4230] text-white font-black py-3.5 h-12 rounded-2xl shadow-lg shadow-[#4f533b]/25 transition flex items-center justify-center gap-2 cursor-pointer text-sm active:scale-[0.98] mt-2"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Daxil olunur...
                      </span>
                    ) : (
                      <><ArrowRight className="w-4 h-4" /> {label.btn}</>
                    )}
                  </Button>
                </form>

                <p className={`text-center text-xs mt-6 font-semibold ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {label.noAcc}{' '}
                  <Link href="/register" className="text-[#4f533b] font-black hover:underline">{label.register}</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}
