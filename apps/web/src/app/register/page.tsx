'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle, Check,
  ShieldCheck, Sparkles, Globe, Sun, Moon, PhoneCall, MapPin,
} from '../components/HeroIconsHub';
import { Button } from '@heroui/react';
import { translations, Language } from '../data/translations';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function RegisterPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>('AZ');
  const t = translations[currentLang] || translations.AZ;

  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+994 ');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [agree, setAgree] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const savedLang = (localStorage.getItem('technomania_lang') as Language) || 'AZ';
    if (savedLang) setCurrentLang(savedLang);
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
  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ['', 'bg-rose-500', 'bg-amber-400', 'bg-[#4f533b]'];
  const strengthLabels = { AZ: ['', 'Zəif', 'Orta', 'Güclü'], EN: ['', 'Weak', 'Medium', 'Strong'], RU: ['', 'Слабый', 'Средний', 'Сильный'] };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError(label.passWeak); return; }
    if (password !== confirmPass) { setError(label.passMismatch); return; }
    if (!agree) { setError(label.agreeErr); return; }
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1600));
    setIsLoading(false);
    setSuccess(true);
    setTimeout(() => router.push('/'), 1400);
  };

  const labels = {
    AZ: {
      title: 'Hesab Yaradın',
      subtitle: 'Xüsusi bonuslar və eksklüziv endirimlərdən yararlanın',
      step1: 'Şəxsi məlumatlar',
      step2: 'Təhlükəsizlik',
      nameLabel: 'Ad Və Soyadınız',
      namePh: 'Məs: Əli Əliyev',
      phoneLabel: 'Mobil Telefon',
      phonePh: '+994 50 000 00 00',
      emailLabel: 'E-poçt (İstəyə bağlı)',
      emailPh: 'nümunə@mail.com',
      passLabel: 'Şifrə Yaradın',
      passPh: 'Ən az 8 simvol',
      confirmLabel: 'Şifrəni Təkrar Edin',
      confirmPh: 'Şifrənizi təkrar daxil edin',
      agreeText: 'Qaydalar və şərtləri, həmçinin Məxfilik siyasətini qəbul edirəm.',
      btnNext: 'Növbəti addım →',
      btnSubmit: 'Qeydiyyatı tamamla',
      hasAcc: 'Artıq hesabınız var?',
      loginLink: 'Daxil olun',
      passWeak: 'Şifrə ən azı 8 simvol olmalıdır',
      passMismatch: 'Şifrələr uyğun gəlmir',
      agreeErr: 'Şərtlərlə razılaşmalısınız',
      successMsg: 'Təbrik edirik! Hesabınız uğurla yaradıldı!',
    },
    EN: {
      title: 'Create Account',
      subtitle: 'Unlock exclusive deals, bonus points & easy installment',
      step1: 'Personal Details',
      step2: 'Security',
      nameLabel: 'Full Name',
      namePh: 'e.g. John Doe',
      phoneLabel: 'Mobile Phone',
      phonePh: '+994 50 000 00 00',
      emailLabel: 'Email Address (Optional)',
      emailPh: 'example@mail.com',
      passLabel: 'Create Password',
      passPh: 'At least 8 characters',
      confirmLabel: 'Confirm Password',
      confirmPh: 'Repeat password',
      agreeText: 'I agree to the Terms & Conditions and Privacy Policy.',
      btnNext: 'Next Step →',
      btnSubmit: 'Complete Registration',
      hasAcc: 'Already have an account?',
      loginLink: 'Sign in',
      passWeak: 'Password must be at least 8 characters',
      passMismatch: 'Passwords do not match',
      agreeErr: 'You must agree to the Terms',
      successMsg: 'Congratulations! Account created successfully!',
    },
    RU: {
      title: 'Создать Аккаунт',
      subtitle: 'Получите доступ к скидкам, бонусам и рассрочке',
      step1: 'Личные данные',
      step2: 'Безопасность',
      nameLabel: 'Имя и Фамилия',
      namePh: 'Например: Али Алиев',
      phoneLabel: 'Мобильный телефон',
      phonePh: '+994 50 000 00 00',
      emailLabel: 'Эл. почта (Необязательно)',
      emailPh: 'example@mail.com',
      passLabel: 'Создайте пароль',
      passPh: 'Не менее 8 символов',
      confirmLabel: 'Подтвердите пароль',
      confirmPh: 'Повторите пароль',
      agreeText: 'Я согласен с Условиями и Политикой конфиденциальности.',
      btnNext: 'Следующий шаг →',
      btnSubmit: 'Завершить регистрацию',
      hasAcc: 'Уже есть аккаунт?',
      loginLink: 'Войти',
      passWeak: 'Пароль должен быть не менее 8 символов',
      passMismatch: 'Пароли не совпадают',
      agreeErr: 'Вы должны принять условия',
      successMsg: 'Поздравляем! Аккаунт успешно создан!',
    },
  };

  const label = labels[currentLang] || labels.AZ;

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

              {/* Step indicator */}
              <div className="mb-8 flex items-center gap-3">
                {([1, 2] as const).map(s => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black border transition-all duration-300 ${
                      step > s ? 'bg-amber-300 border-amber-300 text-slate-900 shadow-md' : step === s ? 'bg-white border-white text-[#4f533b] shadow-md' : 'bg-white/10 border-white/20 text-white/50'
                    }`}>
                      {step > s ? <Check className="w-4 h-4 stroke-[3]" /> : s}
                    </div>
                    <span className={`text-xs font-bold ${step >= s ? 'text-white' : 'text-white/40'}`}>
                      {s === 1 ? label.step1 : label.step2}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex items-center gap-2 text-stone-300 text-xs">
              <ShieldCheck className="w-4 h-4 text-amber-300 flex-shrink-0" />
              <span>Məlumatlarınız tam qorunur (256-bit SSL)</span>
            </div>
          </div>

          {/* RIGHT PANEL: Form (7 cols) */}
          <div className={`lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center ${dark ? 'bg-slate-900/95' : 'bg-white'}`}>

            {success ? (
              <div className="text-center py-12 flex flex-col items-center gap-4 animate-fadeIn">
                <div className="w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-inner text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-10 h-10 animate-bounce" />
                </div>
                <h3 className="font-black text-xl text-slate-900 dark:text-white">Təbrik edirik!</h3>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{label.successMsg}</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{label.title}</h1>
                  <p className={`text-xs sm:text-sm font-medium ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {step === 1 ? 'Addım 1/2: Şəxsi məlumatlarınızı daxil edin' : 'Addım 2/2: Şifrə və təhlükəsizlik'}
                  </p>
                </div>

                {error && (
                  <div className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/50 px-3.5 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900 mb-4 animate-fadeIn">
                    {error}
                  </div>
                )}

                {step === 1 ? (
                  <form onSubmit={handleNext} className="space-y-4">
                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{label.nameLabel}</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          required
                          type="text"
                          placeholder={label.namePh}
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          className={`w-full border rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold outline-none focus:border-[#4f533b] focus:ring-2 focus:ring-[#4f533b]/20 transition placeholder:text-slate-400 ${dark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{label.phoneLabel}</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          required
                          type="tel"
                          placeholder={label.phonePh}
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          className={`w-full border rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold outline-none focus:border-[#4f533b] focus:ring-2 focus:ring-[#4f533b]/20 transition placeholder:text-slate-400 ${dark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{label.emailLabel}</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          placeholder={label.emailPh}
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className={`w-full border rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold outline-none focus:border-[#4f533b] focus:ring-2 focus:ring-[#4f533b]/20 transition placeholder:text-slate-400 ${dark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full bg-[#4f533b] hover:bg-[#3e4230] text-white font-black py-3.5 h-12 rounded-2xl shadow-lg shadow-[#4f533b]/25 transition flex items-center justify-center gap-2 cursor-pointer text-sm active:scale-[0.98] mt-2"
                    >
                      {label.btnNext}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className={`text-xs font-bold flex items-center gap-1 mb-2 cursor-pointer hover:text-[#4f533b] transition ${dark ? 'text-slate-400' : 'text-slate-500'}`}
                    >
                      ← Geri dön
                    </button>

                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{label.passLabel}</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          required
                          type={showPass ? 'text' : 'password'}
                          placeholder={label.passPh}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className={`w-full border rounded-2xl pl-10 pr-11 py-3 text-sm font-semibold outline-none focus:border-[#4f533b] focus:ring-2 focus:ring-[#4f533b]/20 transition placeholder:text-slate-400 ${dark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                        />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5">
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Password strength bar */}
                      {password.length > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex gap-0.5">
                            <div className={`h-full flex-1 transition-all ${passwordStrength >= 1 ? strengthColors[passwordStrength] : ''}`} />
                            <div className={`h-full flex-1 transition-all ${passwordStrength >= 2 ? strengthColors[passwordStrength] : ''}`} />
                            <div className={`h-full flex-1 transition-all ${passwordStrength >= 3 ? strengthColors[passwordStrength] : ''}`} />
                          </div>
                          <span className={`text-[10px] font-bold ${passwordStrength === 1 ? 'text-rose-500' : passwordStrength === 2 ? 'text-amber-500' : 'text-[#4f533b]'}`}>
                            {strengthLabels[currentLang]?.[passwordStrength] || ''}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{label.confirmLabel}</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          required
                          type={showPass ? 'text' : 'password'}
                          placeholder={label.confirmPh}
                          value={confirmPass}
                          onChange={e => setConfirmPass(e.target.value)}
                          className={`w-full border rounded-2xl pl-10 pr-11 py-3 text-sm font-semibold outline-none transition placeholder:text-slate-400 ${
                            confirmPass && confirmPass !== password ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-[#4f533b] focus:ring-2 focus:ring-[#4f533b]/20'
                          } ${dark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 text-slate-900'}`}
                        />
                        {confirmPass && confirmPass === password && (
                          <CheckCircle className="absolute right-10 top-3.5 w-4 h-4 text-[#4f533b]" />
                        )}
                      </div>
                    </div>

                    <label className="flex items-start gap-2.5 cursor-pointer pt-1 select-none">
                      <div
                        onClick={() => setAgree(!agree)}
                        className={`w-4 h-4 rounded-md border flex items-center justify-center mt-0.5 transition flex-shrink-0 ${
                          agree ? 'bg-[#4f533b] border-[#4f533b]' : dark ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {agree && <Check className="w-3 h-3 text-white stroke-[3]" />}
                      </div>
                      <span className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-600'} leading-snug font-medium`}>
                        {label.agreeText}
                      </span>
                    </label>

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
                          Qeydiyyat edilir...
                        </span>
                      ) : (
                        label.btnSubmit
                      )}
                    </Button>
                  </form>
                )}

                <p className={`text-center text-xs mt-6 font-semibold ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {label.hasAcc}{' '}
                  <Link href="/login" className="text-[#4f533b] font-black hover:underline">{label.loginLink}</Link>
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
